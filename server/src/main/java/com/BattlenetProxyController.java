@RestController
@RequestMapping("/api/battlenet")
public class BattlenetProxyController {

    @Value("${battlenet.region}")
    private String region;

    private final BattlenetTokenService tokenService;
    private final WebClient webClient = WebClient.create();

    public BattlenetProxyController(BattlenetTokenService tokenService) {
        this.tokenService = tokenService;
    }

    @GetMapping("/**")
    public Mono<ResponseEntity<String>> proxy(HttpServletRequest request) {
        String path = request.getRequestURI().replaceFirst("/api/battlenet", "");
        String query = request.getQueryString();
        String token = tokenService.getAccessToken();

        String targetUrl = "https://" + region + ".api.blizzard.com" + path
            + (query != null ? "?" + query : "");

        return webClient.get()
            .uri(targetUrl)
            .header("Authorization", "Bearer " + token)
            .retrieve()
            .toEntity(String.class);
    }
}
---
slug: spring-boot-05
order: 5
category: spring-boot
categoryLabel: Spring Boot
title: "Spring Security 6 — 인증·인가·OAuth2·JWT"
summary: "Spring Security 6의 SecurityFilterChain 기반으로 API 인증·인가를 설계하고, JWT/OAuth2 패턴을 이해한다."
publishedAt: 2026-08-26
tags: ["spring-boot"]
---

# Spring Security 6 — 인증·인가·OAuth2·JWT

> 요약: Spring Security 6의 SecurityFilterChain 기반으로 API 인증·인가를 설계하고, JWT/OAuth2 패턴을 이해한다.

---

---

## 1. Security 6에서 달라진 점

- `WebSecurityConfigurerAdapter` **삭제** → `SecurityFilterChain` `@Bean`
- `antMatchers` → `requestMatchers`
- 기본 세션 정책·CSRF 설정이 API 서버 관점에서 재설계 필요
- Method Security: `@EnableMethodSecurity`

---

## 2. 최소 Security 설정 (세션 없는 API)

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // 쿠키 세션 안 쓰면 보통 disable
            .sessionManagement(sm ->
                sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health", "/api/auth/**", "/v3/api-docs/**", "/swagger-ui/**")
                    .permitAll()
                .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll()
                .anyRequest().authenticated()
            )
            .httpBasic(Customizer.withDefaults()); // 데모용. 실무는 JWT/OAuth2

        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

비밀번호는 반드시 `PasswordEncoder`로 해시. 평문 저장 금지.

---

## 3. UserDetailsService

```java
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserAccountRepository repository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserAccount account = repository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        return User.builder()
                .username(account.getEmail())
                .password(account.getPasswordHash())
                .roles(account.getRole().name()) // ROLE_ 접두사 자동
                .build();
    }
}
```

---

## 4. JWT 기반 인증 (실무에서 흔한 API 패턴)

흐름:

1. `POST /api/auth/login` → access token (+ refresh token)
2. 클라이언트: `Authorization: Bearer <token>`
3. 필터에서 토큰 검증 → `SecurityContext`에 Authentication 설정

### 토큰 발급 (개요)

```java
public String createAccessToken(String subject, Collection<String> roles) {
    Instant now = Instant.now();
    return Jwts.builder()
            .subject(subject)
            .claim("roles", roles)
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(15, ChronoUnit.MINUTES)))
            .signWith(secretKey)
            .compact();
}
```

권장 사항:

- Access Token: 짧은 TTL (5~15분)
- Refresh Token: HttpOnly 쿠키 또는 안전한 저장소 + 회전(rotation)
- 비밀키는 환경변수/시크릿 매니저
- 라이브러리: `jjwt` 또는 `spring-security-oauth2-jose` (Nimbus)

### JwtAuthFilter 스케치

```java
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = resolveBearer(request);
        if (token != null && tokenProvider.valid(token)) {
            Authentication auth = tokenProvider.toAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        filterChain.doFilter(request, response);
    }
}
```

필터를 `SecurityFilterChain`에 `UsernamePasswordAuthenticationFilter` 앞에 추가한다.

---

## 5. 메서드 레벨 인가

```java
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/{id}")
public void delete(@PathVariable Long id) { ... }

@PreAuthorize("#email == authentication.name or hasRole('ADMIN')")
@GetMapping("/me/{email}")
public UserResponse me(@PathVariable String email) { ... }
```

URL 매처만으로 부족한 리소스 소유권 검사는 메서드 보안 + 서비스 가드로 처리.

---

## 6. OAuth2 Login / Resource Server

### Resource Server (JWT 검증을 표준으로)

Authorization Server(Keycloak, Auth0, Cognito, Spring Authorization Server)가 발급한 JWT를 검증:

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://auth.example.com/realms/demo
```

```java
http.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
```

직접 JWT 파서를 짜기보다, 가능하면 **OAuth2 Resource Server** 표준을 쓰는 편이 안전하다.

### OAuth2 Login (소셜 로그인 웹앱)

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope: openid, profile, email
```

---

## 7. CORS

SPA와 분리 배포 시:

```java
@Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("https://app.example.com"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
}
```

`*` origin + credentials 조합은 브라우저에서 거부된다. 명시적 origin을 쓴다.

---

## 8. 보안 헤더·운영 체크리스트

- HTTPS 강제 (리버스 프록시/로드밸런서 포함)
- CSRF: 쿠키 세션 사용 시에만 신경 깊게 활성화
- XSS: JSON API라도 응답 콘텐츠 타입 명확히
- 브루트포스: 로그인 rate limit
- 권한 상승 테스트 자동화
- Actuator 엔드포인트 노출 최소화 + 인증

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
```

---

## 9. 테스트

```java
@WebMvcTest(controllers = UserController.class)
@Import(SecurityConfig.class)
class UserControllerSecurityTest {

    @Autowired MockMvc mockMvc;

    @Test
    @WithMockUser(roles = "USER")
    void userCannotDelete() throws Exception {
        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isForbidden());
    }
}
```

`@WithMockUser`, `@WithSecurityContext`로 인가 시나리오를 단위 테스트한다.

---

## 연습

1. `SecurityFilterChain`으로 `/api/public/**`만 허용, 나머지는 인증 필수로 만든다.
2. 회원가입 시 BCrypt로 비밀번호를 저장한다.
3. JWT 로그인 + Bearer 인증 필터를 구현하거나, Resource Server + issuer-uri로 구성한다.
4. `@PreAuthorize`로 ADMIN 전용 삭제 API를 만든다.

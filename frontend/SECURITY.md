# 프론트엔드 보안 적용 내역 및 강화 방안

## ✅ 현재 적용된 보안 내역

1. **CSP(Content-Security-Policy) 메타태그 적용**
2. **Referrer Policy, X-Frame-Options, Permissions-Policy, HSTS, Cache-Control 등 각종 보안 메타태그 적용**
3. **입력값 검증 강화(닉네임/금액 등)**
4. **npm audit 통한 취약점 점검 및 패치**
5. **React StrictMode 적용(잠재적 버그 사전 탐지)**
6. **콘솔/디버깅 코드 자동 제거(vite-plugin-remove-console)**
7. **외부 리소스 SRI, 환경변수/민감정보 노출 방지, 패키지 잠금파일 무결성 등 기본 보안 수칙 안내**
8. **불필요한 외부 리소스/서비스워커/manifest 등 제거 권장**

---

## 🔒 추가로 고려할 수 있는 보안 강화 방안

1. **백엔드와 연동 시 CORS 정책 강화**
   - 허용 origin을 명확히 제한
2. **Helmet 등 서버단 보안 헤더 적용**
   - Express, FastAPI 등에서 helmet 미들웨어 사용
3. **SRI(Subresource Integrity) 적용**
   - 외부 CDN 리소스 사용 시 SRI 해시 적용
4. **HTTP Only 쿠키 사용**
   - JWT 등 민감 토큰은 localStorage 대신 httpOnly 쿠키로 관리
5. **정적 파일 무결성 검증**
   - 빌드 산출물 hash, integrity 체크
6. **보안 취약점 자동 스캔 도구 도입**
   - Snyk, Dependabot 등
7. **정기적 보안 점검 및 업데이트**
   - 의존성 최신화, 보안 패치 주기적 적용
8. **사용자 세션/인증 만료 정책 강화**
   - 장시간 미사용 시 자동 로그아웃 등
9. **로그/에러 모니터링 도구 연동**
   - Sentry, Datadog 등
10. **보안 교육 및 코드리뷰 강화**
    - 개발자 보안 인식 제고, 코드리뷰 시 보안 체크리스트 활용

---

## ✅ 백엔드(FastAPI) 보안 적용 내역

1. **CORS 정책 강화**
   - 신뢰할 수 있는 도메인만 허용(`allow_origins`)
2. **보안 헤더(Helmet) 미들웨어 적용**
   - fastapi-helmet 사용
3. **에러 메시지 최소화**
   - HTTPException detail에 민감 정보/스택트레이스/쿼리 등 노출 금지
4. **SQLite DB 파일 권한 제한**
   - `chmod 600 accountbook.db`로 소유자만 읽기/쓰기 가능
5. **입력값 검증(Pydantic)**
   - 모든 API 입력값에 대해 Pydantic 모델로 검증
6. **SQLAlchemy ORM 사용**
   - SQL Injection 등 기본 방지

---

> 추가 보안(인증/Rate Limiting/로그 등)은 필요시 도입 권장

> **참고:** 프론트엔드 보안은 서버/배포 환경과 연계될 때 더욱 강력해집니다. 서버단 보안 정책과 함께 적용하면 효과가 극대화됩니다. 
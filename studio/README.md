# DEPIDA Sanity Studio

비개발자가 시공사례 등 콘텐츠를 폼으로 편집하는 관리 화면.

## 최초 1회 설정
```bash
cd studio
npm install                 # 이미 설치돼 있으면 생략
npx sanity login            # Sanity 계정 로그인(브라우저 토큰)
npx sanity init --project   # 새 프로젝트 생성 후 projectId 발급
cp .env.example .env        # .env 에 발급받은 projectId 입력
```

## 로컬 실행
```bash
npm run dev                 # http://localhost:3333
```

## 배포(비개발자용 무료 호스팅)
```bash
npm run deploy              # https://<원하는이름>.sanity.studio 로 공개
```

## 스키마
- `schemaTypes/siteCase.ts` — 시공사례(제목·분류·이미지·갤러리 등)

backend/
├── src/
│   ├── domain/
│   │   ├── auth/
│   │   ├── teaching/
│   │   ├── establishment/
│   │   ├── standalone/
│   │   ├── billing/
│   │   ├── contact/
│   │   └── shared/
│   ├── application/
│   │   ├── auth/
│   │   ├── teaching/
│   │   ├── establishment/
│   │   ├── standalone/
│   │   ├── billing/
│   │   └── contact/
│   ├── interfaces/
│   │   ├── persistence/
│   │   ├── mailer.interface.ts
│   │   ├── llm.interface.ts
│   │   └── payment.interface.ts
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   └── supabase/
│   │   ├── mailer/
│   │   ├── llm/
│   │   ├── payment/
│   │   └── config/
│   ├── presentation/
│   │   ├── auth/
│   │   ├── teaching/
│   │   ├── establishment/
│   │   ├── standalone/
│   │   ├── billing/
│   │   ├── contact/
│   │   └── app.module.ts
│   ├── app.module.ts
│   └── main.ts
├── package.json
└── tsconfig.json
# Store99 — Angular Frontend

واجهة Angular 18 (Standalone Components) لـ Store99 E-Commerce API، مبنية بـ:
- **NgRx** (Store + Effects) لإدارة الحالة في Auth, Products, Basket, Orders.
- **Bootstrap 5** للتصميم (+ Bootstrap Icons).
- **Reactive Forms** لفورمات تسجيل الدخول، إنشاء الحساب، وإتمام الطلب.

## التشغيل

```bash
npm install
npm start
```

قبل التشغيل، حدّث الـ Base URL بتاع الـ API في:
`src/environments/environment.development.ts` و `environment.ts`
```ts
apiUrl: 'https://localhost:7001/api'   // غيّرها لبورت الـ API عندك
```

## الهيكل

```
src/app/
  core/            # models + services + guard + interceptors (auth token, error handling)
  store/           # NgRx: auth, products, basket, orders (actions/reducer/effects/selectors)
  shared/          # navbar, pagination (components مشتركة)
  features/        # الصفحات: auth (login/register), products (list/detail),
                   # basket, orders (checkout/list/detail)
```

## ملاحظات مهمة

- **الباسكت (Basket)**: مُدارة بالكامل عبر NgRx — أي إضافة/تعديل/حذف بيحصل في الـ reducer
  محلياً فوراً (UX سريعة)، وبعدها effect بيبعتها لـ `POST /api/Basket/UpdateBasket` تلقائياً
  عشان تتزامن مع السيرفر. الـ BasketId بيتولد كـ GUID ويتخزن في localStorage.
- **Auth**: التوكن بيتخزن في localStorage (`store99_token`) وبيتضاف تلقائياً على كل
  request عبر `auth.interceptor.ts`. لو الـ API رجّع 401 بيتم تسجيل الخروج وتحويل لصفحة الدخول.
- **`/api/Account/Register`** حسب الـ Swagger بتاعك بياخد الـ query params (Email,
  PhoneNumber, DisplayName, Password, DOB, Gender) + Photo كـ multipart — تم تنفيذها بنفس الشكل.
- **Checkout/Orders** محمية بـ `authGuard` — لازم تسجل دخول الأول.
- **DeliveryMethodId**: الفورم فيه قيمة افتراضية (1)؛ لو عندك endpoint حقيقي لجلب طرق
  الشحن بأسعارها، سهل تربطه بـ `basketService.getDeliveryMethods()` الموجودة بالفعل.

## نقاط ممكن تتوسع فيها بعدين
- Wishlist, Reviews, Notifications, Address book (مش داخلة في السكوب الحالي).
- Refresh token flow تلقائي عند انتهاء صلاحية الـ JWT.
- Unit tests للـ reducers/effects.

# Product Kiosk - Odoo 17

واجهة بسيطة للبحث عن المنتجات وإنشائها في Odoo 17

A simple kiosk-style interface for product lookup and creation in Odoo 17.

## Features | المميزات

- **Product Search | البحث عن المنتجات**: Search by product name or barcode
- **Product Display | عرض المنتجات**: View product details (name, price, cost, category, image)
- **Product Creation | إنشاء المنتجات**: Create new products if not found
- **Auto Barcode | توليد الباركود**: Generate timestamp-based barcodes automatically
- **Image Upload | رفع الصور**: Upload product images with preview
- **Expiry Tracking | تتبع الصلاحية**: Track product expiry dates (enabled by default)
- **POS Integration | تكامل نقاط البيع**: Set POS categories directly
- **RTL Support | دعم العربية**: Full Arabic RTL interface

## Screenshots | لقطات الشاشة

The kiosk provides a clean, simple interface accessible at `/product/kiosk`

## Installation | التثبيت

1. Copy the `product_kiosk` folder to your Odoo addons directory
2. Restart Odoo server
3. Go to Apps → Update Apps List
4. Search for "Product Kiosk" and install

## Usage | الاستخدام

1. Navigate to the "بحث المنتجات" app in Odoo dashboard
2. Or access directly via: `http://your-odoo-url/product/kiosk`
3. Enter product name or barcode in the search box
4. If found: View and edit product details
5. If not found: Create a new product

## Dependencies | المتطلبات

- `base`
- `product`
- `point_of_sale`

## Product Fields | حقول المنتج

| Field | الحقل | Description |
|-------|-------|-------------|
| Name | اسم المنتج | Product name (required) |
| Barcode | الباركود | Product barcode |
| Sale Price | سعر البيع | Product selling price |
| Cost | التكلفة | Product cost price |
| POS Category | فئة نقاط البيع | Category for POS |
| Product Type | نوع المنتج | Storable/Consumable/Service |
| Expiry Tracking | تتبع الصلاحية | Enable lot tracking for expiry |
| Image | صورة المنتج | Product image |

## Default Values | القيم الافتراضية

- **Product Type**: Storable Product (منتج قابل للتخزين)
- **Expiry Tracking**: Enabled (مفعل)
- **Available in POS**: Yes

## Technical Details | التفاصيل التقنية

### Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/product/kiosk` | GET | Main kiosk page |
| `/product/kiosk/search` | POST | Search product API |
| `/product/kiosk/save` | POST | Create/Update product API |

### File Structure

```
product_kiosk/
├── __init__.py
├── __manifest__.py
├── README.md
├── controllers/
│   ├── __init__.py
│   └── main.py
├── static/
│   ├── description/
│   │   └── icon.svg
│   └── src/
│       ├── css/
│       │   └── kiosk.css
│       └── js/
│           └── kiosk.js
└── views/
    ├── kiosk_menus.xml
    └── kiosk_templates.xml
```

## Author | المطور

**Youssef Shakir**
- Website: [donialink.com](https://donialink.com)

## License | الرخصة

AGPL-3

## Version | الإصدار

17.0.1.0.0

# -*- coding: utf-8 -*-
{
    'name': 'Product Kiosk',
    'version': '17.0.1.0.0',
    'category': 'Inventory/Product',
    'summary': 'Simple kiosk interface for product lookup and creation',
    'description': """
        A simple, clean interface for:
        - Searching products by name or barcode
        - Viewing product details (name, price, cost, POS category, image)
        - Creating new products if not found
    """,
    'author': 'Youssef Shakir',
    'website': 'https://donialink.com',
    'license': 'AGPL-3',
    'depends': ['base', 'product', 'point_of_sale'],
    'data': [
        'views/kiosk_menus.xml',
        'views/kiosk_templates.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'product_kiosk/static/src/css/kiosk.css',
            'product_kiosk/static/src/js/kiosk.js',
        ],
    },
    'installable': True,
    'application': True,
}

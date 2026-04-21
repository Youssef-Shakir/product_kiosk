# -*- coding: utf-8 -*-
import base64
import json
from odoo import http
from odoo.http import request


class ProductKioskController(http.Controller):

    @http.route('/product/kiosk', type='http', auth='user', website=False)
    def kiosk_page(self, **kwargs):
        """Render the kiosk page."""
        # Get POS categories for dropdown
        pos_categories = request.env['pos.category'].sudo().search([])
        categories_data = [{'id': cat.id, 'name': cat.name} for cat in pos_categories]

        return request.render('product_kiosk.kiosk_page', {
            'pos_categories': json.dumps(categories_data),
        })

    @http.route('/product/kiosk/search', type='json', auth='user', methods=['POST'])
    def search_product(self, query):
        """Search for product by name or barcode."""
        Product = request.env['product.product'].sudo()

        # First try exact barcode match
        product = Product.search([('barcode', '=', query)], limit=1)

        # If not found, search by name (contains)
        if not product:
            product = Product.search([('name', 'ilike', query)], limit=1)

        if product:
            # Get POS category IDs
            pos_categ_ids = product.pos_categ_ids.ids if product.pos_categ_ids else []

            return {
                'found': True,
                'product': {
                    'id': product.id,
                    'name': product.name,
                    'barcode': product.barcode or '',
                    'lst_price': product.lst_price,
                    'standard_price': product.standard_price,
                    'pos_categ_ids': pos_categ_ids,
                    'image': product.image_1920.decode('utf-8') if product.image_1920 else '',
                    'detailed_type': product.detailed_type or 'product',
                    'tracking': product.tracking or 'none',
                }
            }

        return {'found': False}

    @http.route('/product/kiosk/list', type='json', auth='user', methods=['POST'])
    def list_products(self, query=''):
        """Get products for autocomplete with server-side filtering."""
        Product = request.env['product.product'].sudo()
        domain = []
        if query:
            domain = ['|', ('name', 'ilike', query), ('barcode', 'like', query)]
        products = Product.search(domain, limit=10)

        return {
            'products': [{
                'id': p.id,
                'name': p.name,
                'barcode': p.barcode or '',
            } for p in products]
        }

    @http.route('/product/kiosk/save', type='json', auth='user', methods=['POST'])
    def save_product(self, product_id, data):
        """Create or update a product."""
        Product = request.env['product.product'].sudo()

        # Prepare values
        values = {
            'name': data.get('name'),
            'lst_price': float(data.get('lst_price', 0)),
            'standard_price': float(data.get('standard_price', 0)),
            'available_in_pos': True,
            'detailed_type': data.get('detailed_type', 'product'),
            'tracking': data.get('tracking', 'lot'),
        }

        # Handle barcode
        if data.get('barcode'):
            values['barcode'] = data.get('barcode')

        # Handle POS category
        pos_categ_id = data.get('pos_categ_id')
        if pos_categ_id:
            values['pos_categ_ids'] = [(6, 0, [int(pos_categ_id)])]

        # Handle image
        if data.get('image'):
            values['image_1920'] = data.get('image')

        try:
            if product_id:
                # Update existing product
                product = Product.browse(int(product_id))
                product.write(values)
                return {'success': True, 'message': 'تم تحديث المنتج بنجاح', 'product_id': product.id}
            else:
                # Create new product
                product = Product.create(values)
                return {'success': True, 'message': 'تم إنشاء المنتج بنجاح', 'product_id': product.id}
        except Exception as e:
            return {'success': False, 'message': str(e)}

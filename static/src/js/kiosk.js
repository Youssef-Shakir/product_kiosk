/** Product Kiosk JavaScript */
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const searchInput = document.getElementById('search_input');
    const searchBtn = document.getElementById('search_btn');
    const searchStatus = document.getElementById('search_status');
    const productFormSection = document.getElementById('product_form_section');
    const productForm = document.getElementById('product_form');
    const formTitle = document.getElementById('form_title');
    const saveBtnText = document.getElementById('save_btn_text');
    const clearBtn = document.getElementById('clear_btn');
    const generateBarcodeBtn = document.getElementById('generate_barcode_btn');
    const productImage = document.getElementById('product_image');
    const imagePreview = document.getElementById('image_preview');
    const categorySelect = document.getElementById('product_category');

    // Modal elements
    const successModal = document.getElementById('success_modal');
    const errorModal = document.getElementById('error_modal');
    const modalTitle = document.getElementById('modal_title');
    const modalMessage = document.getElementById('modal_message');
    const errorMessage = document.getElementById('error_message');

    // Autocomplete dropdown
    let autocompleteDropdown = document.getElementById('autocomplete_dropdown');
    if (!autocompleteDropdown) {
        autocompleteDropdown = document.createElement('div');
        autocompleteDropdown.id = 'autocomplete_dropdown';
        autocompleteDropdown.className = 'autocomplete-dropdown';
        searchInput.parentNode.appendChild(autocompleteDropdown);
    }

    // State
    let currentProductId = null;
    let currentImageBase64 = null;
    let allProducts = []; // Cache for autocomplete
    let searchTimeout = null;

    // Initialize categories dropdown
    function initCategories() {
        if (typeof posCategories !== 'undefined' && posCategories.length > 0) {
            posCategories.forEach(function(cat) {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
        }
    }

    // JSON RPC call helper
    function jsonRpc(url, params) {
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'call',
                params: params,
                id: Math.floor(Math.random() * 1000000)
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error.data?.message || data.error.message || 'Unknown error');
            }
            return data.result;
        });
    }

    // Check if input looks like a barcode (only digits, length >= 4)
    function isBarcode(value) {
        return /^\d{4,}$/.test(value);
    }

    // Load all products for autocomplete cache
    function loadProductsCache() {
        jsonRpc('/product/kiosk/list', {})
            .then(function(result) {
                allProducts = result.products || [];
            })
            .catch(function(error) {
                console.error('Error loading products cache:', error);
                allProducts = [];
            });
    }

    // Filter products for autocomplete
    function filterProducts(query) {
        if (!query || query.length < 2) return [];
        const lowerQuery = query.toLowerCase();
        return allProducts.filter(function(p) {
            return p.name.toLowerCase().includes(lowerQuery) ||
                   (p.barcode && p.barcode.includes(query));
        }).slice(0, 8); // Limit to 8 results
    }

    // Show autocomplete dropdown
    function showAutocomplete(matches) {
        autocompleteDropdown.innerHTML = '';

        if (matches.length === 0) {
            autocompleteDropdown.style.display = 'none';
            return;
        }

        matches.forEach(function(product) {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.innerHTML = '<span class="product-name">' + product.name + '</span>' +
                           (product.barcode ? '<span class="product-barcode">' + product.barcode + '</span>' : '');

            item.addEventListener('click', function() {
                searchInput.value = product.name;
                autocompleteDropdown.style.display = 'none';
                searchProduct();
            });

            autocompleteDropdown.appendChild(item);
        });

        autocompleteDropdown.style.display = 'block';
    }

    // Hide autocomplete
    function hideAutocomplete() {
        autocompleteDropdown.style.display = 'none';
    }

    // Handle search input for autocomplete
    function handleSearchInput(e) {
        const query = e.target.value.trim();

        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (!query) {
            hideAutocomplete();
            searchStatus.textContent = '';
            return;
        }

        // Delay autocomplete to avoid too many searches
        searchTimeout = setTimeout(function() {
            const matches = filterProducts(query);
            showAutocomplete(matches);
        }, 150);
    }

    // Search product
    function searchProduct() {
        const query = searchInput.value.trim();
        hideAutocomplete();

        if (!query) {
            searchStatus.textContent = 'الرجاء إدخال اسم أو باركود';
            searchStatus.className = 'search-status warning';
            return;
        }

        searchStatus.textContent = 'جاري البحث...';
        searchStatus.className = 'search-status';

        jsonRpc('/product/kiosk/search', { query: query })
            .then(function(result) {
                if (result.found) {
                    // Product found - show details
                    displayProduct(result.product);
                    searchStatus.textContent = 'تم العثور على المنتج';
                    searchStatus.className = 'search-status success';
                } else {
                    // Product not found - show create form with smart field placement
                    showCreateForm(query);
                    searchStatus.textContent = 'المنتج غير موجود - يمكنك إنشاؤه';
                    searchStatus.className = 'search-status warning';
                }
            })
            .catch(function(error) {
                searchStatus.textContent = 'خطأ في البحث: ' + error.message;
                searchStatus.className = 'search-status error';
            });
    }

    // Display product data in form
    function displayProduct(product) {
        currentProductId = product.id;
        currentImageBase64 = product.image || null;

        document.getElementById('product_id').value = product.id;
        document.getElementById('product_name').value = product.name;
        document.getElementById('product_barcode').value = product.barcode || '';
        document.getElementById('product_price').value = product.lst_price || 0;
        document.getElementById('product_cost').value = product.standard_price || 0;

        // Set category
        if (product.pos_categ_ids && product.pos_categ_ids.length > 0) {
            categorySelect.value = product.pos_categ_ids[0];
        } else {
            categorySelect.value = '';
        }

        // Set product type
        document.getElementById('product_type').value = product.detailed_type || 'product';

        // Set tracking
        document.getElementById('product_tracking').checked = (product.tracking === 'lot');

        // Show image
        if (product.image) {
            imagePreview.innerHTML = '<img src="data:image/png;base64,' + product.image + '" alt="Product Image"/>';
        } else {
            imagePreview.innerHTML = '<span class="no-image">لا توجد صورة</span>';
        }

        formTitle.textContent = 'تعديل المنتج';
        saveBtnText.textContent = 'تحديث';
        productFormSection.style.display = 'block';
    }

    // Show create form for new product - with smart barcode/name detection
    function showCreateForm(query) {
        currentProductId = null;
        currentImageBase64 = null;

        document.getElementById('product_id').value = '';
        document.getElementById('product_price').value = '';
        document.getElementById('product_cost').value = '';
        categorySelect.value = '';
        imagePreview.innerHTML = '';
        productImage.value = '';

        // Smart detection: if query looks like barcode, put it in barcode field
        if (isBarcode(query)) {
            document.getElementById('product_name').value = '';
            document.getElementById('product_barcode').value = query;
            searchStatus.textContent = 'باركود جديد - أدخل اسم المنتج';
        } else {
            document.getElementById('product_name').value = query;
            document.getElementById('product_barcode').value = '';
            searchStatus.textContent = 'منتج جديد - يمكنك إضافة الباركود';
        }

        // Set defaults for new product
        document.getElementById('product_type').value = 'product'; // storable
        document.getElementById('product_tracking').checked = true; // track expiry by default

        formTitle.textContent = 'إنشاء منتج جديد';
        saveBtnText.textContent = 'إنشاء';
        productFormSection.style.display = 'block';
    }

    // Clear form
    function clearForm() {
        currentProductId = null;
        currentImageBase64 = null;
        productForm.reset();
        imagePreview.innerHTML = '';
        productFormSection.style.display = 'none';
        searchInput.value = '';
        searchStatus.textContent = '';
        searchStatus.className = 'search-status';
        hideAutocomplete();

        // Ensure defaults are set
        document.getElementById('product_type').value = 'product';
        document.getElementById('product_tracking').checked = true;
    }

    // Generate barcode (timestamp-based)
    function generateBarcode() {
        const now = new Date();
        const barcode = '' +
            now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');
        document.getElementById('product_barcode').value = barcode;
    }

    // Handle image upload
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const base64 = event.target.result.replace(/^data:image\/[a-z]+;base64,/, '');
            currentImageBase64 = base64;
            imagePreview.innerHTML = '<img src="' + event.target.result + '" alt="Preview"/>';
        };
        reader.readAsDataURL(file);
    }

    // Save product
    function saveProduct(e) {
        e.preventDefault();

        const name = document.getElementById('product_name').value.trim();
        if (!name) {
            showError('الرجاء إدخال اسم المنتج');
            return;
        }

        const data = {
            name: name,
            barcode: document.getElementById('product_barcode').value.trim(),
            lst_price: document.getElementById('product_price').value || 0,
            standard_price: document.getElementById('product_cost').value || 0,
            pos_categ_id: categorySelect.value || null,
            image: currentImageBase64,
            detailed_type: document.getElementById('product_type').value,
            tracking: document.getElementById('product_tracking').checked ? 'lot' : 'none'
        };

        const productId = currentProductId;

        jsonRpc('/product/kiosk/save', { product_id: productId, data: data })
            .then(function(result) {
                if (result.success) {
                    showSuccess(result.message);
                    clearForm();
                    // Refresh products cache
                    loadProductsCache();
                } else {
                    showError(result.message);
                }
            })
            .catch(function(error) {
                showError('خطأ في الحفظ: ' + error.message);
            });
    }

    // Show success modal
    function showSuccess(message) {
        modalTitle.textContent = 'نجاح';
        modalMessage.textContent = message;
        successModal.style.display = 'flex';
    }

    // Show error modal
    function showError(message) {
        errorMessage.textContent = message;
        errorModal.style.display = 'flex';
    }

    // Close modals
    function closeModals() {
        successModal.style.display = 'none';
        errorModal.style.display = 'none';
    }

    // Event listeners
    searchBtn.addEventListener('click', searchProduct);
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            hideAutocomplete();
            searchProduct();
        }
    });

    // Hide autocomplete when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
            hideAutocomplete();
        }
    });

    clearBtn.addEventListener('click', clearForm);
    generateBarcodeBtn.addEventListener('click', generateBarcode);
    productImage.addEventListener('change', handleImageUpload);
    productForm.addEventListener('submit', saveProduct);

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(function(btn) {
        btn.addEventListener('click', closeModals);
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(function(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModals();
            }
        });
    });

    // Initialize
    initCategories();
    loadProductsCache();
});

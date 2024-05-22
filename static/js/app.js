$(document).ready(function() {
    $('#image-upload')
        .on('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).addClass('dragging'); 
        })
        .on('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('dragging'); 
        })
        .on('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('dragging'); 
            let files = e.originalEvent.dataTransfer.files;
            if (files.length > 0) {
                displayImage(files[0]);
            }
        });

    $('#image-upload').on('click', function(e) {
        e.stopPropagation();
        $('#image').trigger('click');
    });

    $('#image').on('click', function(e) {
        e.stopPropagation();
    });

    $('#image').change(function() {
        if (this.files && this.files[0]) {
            displayImage(this.files[0]);
        }
    });
    $('.product-actions button[aria-label="Add to cart"]').click(function() {
        var productCard = $(this).closest('.product-card');
        var name = productCard.find('.product-info strong').text();
        var price = parseFloat(productCard.find('.product-info').text().match(/Price: \£([\d.]+)/)[1]);
        var productId = productCard.attr('data-product-id');
        var quantity = parseInt(productCard.find('.quantity-input').val());
        addToCart(name, price, productId, quantity);
    });

    function displayImage(file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#uploadedImage').attr('src', e.target.result).show();
        };
        reader.readAsDataURL(file);
    }
});

function toggleForm() {
    $('#addProductForm').toggleClass('hidden');
}

function toggleCartVisibility() {
    $('#cartSection').toggle();
}

function addToCart(name, price, productId, quantity) {
    var listItem = $('#shoppingCart').find('[data-product-id="' + productId + '"]');
    if (listItem.length) {
        var currentQuantity = parseInt(listItem.attr('data-quantity'));
        var newQuantity = currentQuantity + quantity;
        listItem.attr('data-quantity', newQuantity);
        listItem.find('.item-quantity').text('x ' + newQuantity);
        listItem.find('.item-price').text(" - £" + (price * newQuantity).toFixed(2));
    } else {
        listItem = $('<li>').attr({
            'data-product-id': productId,
            'data-product-price': price,
            'data-quantity': quantity
        });
        $('<span>').addClass('item-name').text(name).appendTo(listItem);
        $('<span>').addClass('item-quantity').text('x ' + quantity).appendTo(listItem);
        $('<span>').addClass('item-price').text(" - £" + (price * quantity).toFixed(2)).appendTo(listItem);
        $('#shoppingCart').append(listItem);
    }
    updateTotalCost();
}

function updateTotalCost() {
    var total = 0;
    $('#shoppingCart li').each(function() {
        var price = parseFloat($(this).attr('data-product-price'));
        var quantity = parseInt($(this).attr('data-quantity'), 10);
        total += price * quantity;
    });
    $('#shoppingCartTotal').text("Total: £" + total.toFixed(2));
}

function deleteProduct(productId) {
    $.ajax({
        url: '/delete_product/' + encodeURIComponent(productId),
        type: 'DELETE',
        success: function() {
            console.log('Product deleted successfully');
            location.reload(); 
        },
        error: function(xhr) {
            console.error('Request failed. Returned status of ' + xhr.status);
        }
    });
}

$('#addProductBtn').on('click', function() {
    $('#addProductForm').toggleClass('hidden');
});

function setupEventListeners() {
    document.getElementById('checkoutButton').addEventListener('click', handleCheckout);
    document.getElementById('userInfoForm').addEventListener('submit', function(event) {
        event.preventDefault();
        updateUserInfo();
    });
}
function handleCheckout() {
    const cartData = extractCartData();
    if (cartData.length > 0) {
        fetchCheckoutData(cartData);
    } else {
        alert('Your cart is empty. Please add items before proceeding to checkout.');
    }
}

function extractCartData() {
    const cartData = [];
    document.querySelectorAll('#shoppingCart li').forEach(item => {
        const productId = item.getAttribute('data-product-id');
        const quantity = parseInt(item.getAttribute('data-quantity'), 10);
        if (!isNaN(quantity) && quantity > 0) {
            cartData.push({ productId, quantity });
        }
    });
    return cartData;
}

function fetchCheckoutData(cartData) {
    // Debugging: Log the cart data to be sent
    console.log('Sending checkout data:', JSON.stringify({items: cartData}));

    fetch('/checkout', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({items: cartData}),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Checkout failed with status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Checkout successful', data);
        alert('Checkout successful!');
    })
    .catch(error => {
        console.error('Checkout failed:', error);
        alert('Checkout failed. Please try again.');
    });
}
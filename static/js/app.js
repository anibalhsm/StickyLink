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

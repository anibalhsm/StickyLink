$(document).ready(function() {
    // Enhance drag and drop functionality
    $('#image-upload')
        .on('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).addClass('dragging'); // Add class for visual feedback
        })
        .on('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('dragging'); // Remove class when not dragging
        })
        .on('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('dragging'); // Remove class on drop
            let files = e.originalEvent.dataTransfer.files;
            // Display the first file as an image preview, if available
            if (files.length > 0) {
                displayImage(files[0]);
            }
        });

    // Open file explorer when clicking on the drag and drop area
    $('#image-upload').on('click', function(e) {
        // This line prevents the file input click from bubbling up and potentially causing an infinite loop
        e.stopPropagation();
        $('#image').trigger('click');
    });

    // Prevent the file input click from further propagation to avoid any potential infinite loop
    $('#image').on('click', function(e) {
        e.stopPropagation();
    });

    // Handle file input changes to display the image
    $('#image').change(function() {
        if (this.files && this.files[0]) {
            displayImage(this.files[0]);
        }
    });
    $('.product-actions button[aria-label="Add to cart"]').click(function() {
        var productCard = $(this).closest('.product-card');
        var name = productCard.find('.product-info strong').text();
        var price = parseFloat(productCard.find('.product-info').text().match(/Price: \$([\d.]+)/)[1]);
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

// Function to toggle form visibility
function toggleForm() {
    $('#addProductForm').toggleClass('hidden');
}

// Function to toggle cart visibility
function toggleCartVisibility() {
    $('#cartSection').toggle();
}

// Function to add items to the cart
function addToCart(name, price, productId, quantity) {
    var listItem = $('#shoppingCart').find('[data-product-id="' + productId + '"]');
    if (listItem.length) {
        var currentQuantity = parseInt(listItem.attr('data-quantity'));
        listItem.attr('data-quantity', currentQuantity + quantity);
        listItem.find('.item-quantity').text('x ' + (currentQuantity + quantity));
        listItem.find('.item-price').text(" - $" + (price * (currentQuantity + quantity)).toFixed(2));
    } else {
        listItem = $('<li>').attr({
            'data-product-id': productId,
            'data-product-price': price,
            'data-quantity': quantity
        });
        $('<span>').addClass('item-name').text(name).appendTo(listItem);
        $('<span>').addClass('item-quantity').text('x ' + quantity).appendTo(listItem);
        $('<span>').addClass('item-price').text(" - $" + (price * quantity).toFixed(2)).appendTo(listItem);
        $('#shoppingCart').append(listItem);
    }
    updateTotalCost();
}


// Function to update total cost
function updateTotalCost() {
    var total = 0;
    $('#shoppingCart li').each(function() {
        var price = parseFloat($(this).attr('data-product-price'));
        var quantity = parseInt($(this).attr('data-quantity'), 10);
        total += price * quantity;
    });
    $('#shoppingCartTotal').text("Total: $" + total.toFixed(2));
}

// Function to delete a product
function deleteProduct(productId) {
    $.ajax({
        url: '/delete_product/' + encodeURIComponent(productId),
        type: 'DELETE',
        success: function() {
            console.log('Product deleted successfully');
            location.reload(); // Refresh the page to update the UI
        },
        error: function(xhr) {
            console.error('Request failed. Returned status of ' + xhr.status);
        }
    });
}

$('#addProductBtn').on('click', function() {
    $('#addProductForm').toggleClass('hidden');
});



var orderData = {
    items: [{ id: "yelpcamp-registration" }],
    currency: "usd"
};


var stripe = Stripe('pk_test_51J035sSJwEIKIXjzPmIYIuHvubHbBBNcxpH5tPVVXJTHxHS37aIeepwXNzBxizU6HzQjwhAK1nCMiXL8BwtfkBvS00cD1iREig');
var elements = stripe.elements();

var elements = stripe.elements();
var style = {
    base: {
        color: "#32325d",
    }
};

var card = elements.create("card", { style: style });
card.mount("#card-element");


card.on('change', ({ error }) => {
    let displayError = document.getElementById('card-errors');
    if (error) {
        displayError.textContent = error.message;
    } else {
        displayError.textContent = '';
    }
});

var form = document.getElementById('payment-form');
let displayError = document.getElementById('card-errors');
function errorHandler(err) {
    changeLoadingState(false);
    displayError.textContent = err;
}

form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    changeLoadingState(true);

    stripe.createPaymentMethod('card', card)
        .then(function (result) {
            if (result.error) {
                errorHandler(result.error.message);
            } else {
                orderData.paymentMethodId = result.paymentMethod.id;

                return fetch("/pay", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(orderData)
                });
            }
        })
        .then(function (result) {
            return result.json();
        })
        .then(function (response) {
            if (response.error) {
                errorHandler(response.error);
            } else {
                window.location.href = '/campgrounds?paid=true'
            }
        })
        .catch(err => {
            errorHandler(err.error);
        })
    // If the client secret was rendered server-side as a data-secret attribute
    // on the <form> element, you can retrieve it here by calling `form.dataset.secret`

});



const changeLoadingState = isLoading => {
    if (isLoading) {
        document.querySelector("button").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#button-text").classList.add("hidden");
    } else {
        document.querySelector("button").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#button-text").classList.remove("hidden");
    }
};
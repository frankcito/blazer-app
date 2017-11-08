import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage  } from 'ionic-angular';
import { CartService } from '../../providers/service/cart-service';
import { Values } from '../../providers/service/values';
import { Functions } from '../../providers/service/functions';


@IonicPage()
@Component({
    templateUrl: 'cart.html'
})
export class CartPage {
    cart: any;
    status: any;
    obj: any;
    quantity: number;
    update: any;
    options: any;
    number: any;
    addProduct: boolean = true;
    coupon: any;
    a: any;
    disableSubmit: boolean = false;
    buttonCoupon: boolean = false;
    disableSubmitCoupon: boolean = false;
    chosen_shipping: any;
    shipping: any;
    Apply: any;
    Checkout: any;
    precio_total: any = 0;
    descuento_total: any = 0;
    constructor(public nav: NavController, public service: CartService, public values: Values, public params: NavParams, public functions: Functions) {
        this.Apply = "Apply";
        this.Checkout = "Checkout";
        this.quantity = 1;
        this.options = [];
        this.obj = params.data;
        this.service.loadCart()
            .then((results) => this.handleCartInit(results));
        
    }
    handleCartInit(results) {
        this.cart = results;
        this.shipping = results.zone_shipping;
        this.chosen_shipping = results.chosen_shipping;
        this.calcular();
    }
    calcular() { 
        this.precio_total = 0;
        this.descuento_total = 0;
        for (var item in this.cart.coupon_discount_totals){
            this.descuento_total += this.cart.coupon_discount_totals[item]
        }
        this.cart.cart_session_data.discount_cart = this.descuento_total;
        for (var item in this.cart.cart_contents) {
            this.precio_total += this.cart.cart_contents[item].price * this.cart.cart_contents[item].quantity;
            //this.functions.showAlert('Numero de productos', this.cart.cart_contents[item].price);
        }
        this.cart.cart_session_data.total = this.precio_total - this.descuento_total;
    } 

    handleCart(results) {
        this.cart = results;
        this.calcular();
    }
    delete(key) {
        this.service.deleteItem(key)
            .then((results) => this.handleCart(results));
    }
    checkout() {
        this.disableSubmit = true;
        this.Checkout = "PleaseWait";
        this.service.checkout()
            .then((results) => this.handleBilling(results));
    }
    handleBilling(results) {
        this.disableSubmit = false;
        this.Checkout = "Checkout";
        this.nav.push('BillingAddressForm', results);
    }
    deleteFromCart(id, key) {
        this.service.deleteFromCart(id, key)
            .then((results) => this.handleCart(results));
            
    }
    addToCart(id, key) {
        this.service.addToCart(id, key)
            .then((results) => this.handleCart(results));
    }
    updateCart(results) {
        this.service.loadCart()
            .then((results) => this.handleCart(results));
    }
    handleAddToCart(results) {
        this.service.loadCart()
            .then((results) => this.handleCart(results));
    }
    submitCoupon() {
        if (this.cart.coupon != undefined) {
            this.disableSubmitCoupon = true;
            this.Apply = "Apply";
            this.service.submitCoupon(this.cart.coupon)
                .then((results) => this.handleCoupon(results));
        }
    }
    removeCoupon() {
        this.service.removeCoupon(this.cart.applied_coupons)
            .then((results) => this.handleCoupon(results));
    }
    handleCoupon(results) {
        console.log(results);
        this.disableSubmitCoupon = false;
        this.Apply = "Apply";
        this.functions.showAlert("STATUS", results._body);
        this.service.loadCart()
            .then((results) => this.handleCart(results));
        this.calcular();
    }
    handleResults(a) {
        if (a.message.status == 'success') {
            this.functions.showAlert(a.message.status, a.message.text);
        }
        else {
            this.functions.showAlert(a.message.status, a.message.text);
        }
    }
    updateShipping(method) {
        this.chosen_shipping = method;
        this.service.updateShipping(method)
            .then((results) => this.handleShipping(results));
        this.calcular();
    }
    handleShipping(results) {
        this.cart = results;
        this.calcular();
    }
}
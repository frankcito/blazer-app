import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content, IonicPage } from 'ionic-angular';
import { ProductService } from '../../providers/service/product-service';
import { Values } from '../../providers/service/values';
import { Functions } from '../../providers/service/functions';
import {md5} from './md5';


@IonicPage()
@Component({
    templateUrl: 'product.html'
})
export class ProductPage {
    @ViewChild(Content) content: Content;
    product: any;
    id: any;
    status: any;
    options: any;
    opt: any;
    message: any;
    wishlist: any;
    quantity: any;
    reviews: any;
    reviewForm: any;
    nickname: any;
    details: any;
    AddToCart: any;
     disableSubmit: boolean = false;
     wishlistIcon: boolean = false;
    
    marca: boolean =false;
    descripcion: boolean =false;
    cuidados: boolean =false;
    cambios: boolean =false;
    form: any;

    constructor(public nav: NavController, public service: ProductService, params: NavParams, public functions: Functions, public values: Values) {
        this.id = params.data;
        
        this.options = [];
        this.quantity = "1";
        this.AddToCart = "AddToCart";
        this.service.getProduct(this.id)
            .then((results) => this.handleProductResults(results));
        this.getReviews();

    }
    mostrarmarca() {
        if (this.marca==true) { this.marca=false;} else this.marca = true;
    }
    mostrardescripcion() {
        if (this.descripcion==true) { this.descripcion=false;} else this.descripcion = true;
    }
    mostrarcuidados() {
        if (this.cuidados==true) { this.cuidados=false;} else this.cuidados = true;
    }
    mostrarcambios() {
        if (this.cambios==true) { this.cambios=false;} else this.cambios = true;
    }


    handleProductResults(results){
        this.product = results;

    }

    getProduct(id) {
        this.nav.push('ProductPage', id);
    }
    addToCart(id) {
        if (this.product.product.type == 'variable' && this.options.length == 0) {

            this.functions.showAlert('¿Talla?', 'Por favor, selecciona una talla.')
        }
        
        else {
            this.disableSubmit= true;
           // this.AddToCart = "Adding to cart...";
            var text = '{';
            var i;
            for (i = 0; i < this.options.length; i++) {
                var res = this.options[i].split(":");
                for (var j = 0; j < res.length; j = j + 2) {
                    text += '"' + res[j] + '":"' + res[j + 1] + '",';
                }
            }
            text += '"product_id":"' + id + '",';
            text += '"quantity":"' + this.quantity + '"}';
            var obj = JSON.parse(text);
            this.service.addToCart(obj)
                .then((results) => this.updateCart(results));
        }
    }
    chnageProduct() {
        var text = '{';
        var i;
        for (i = 0; i < this.options.length; i++) {
            var res = this.options[i].split(":");
            for (var j = 0; j < res.length; j = j + 2) {
                text += '"' + res[j] + '":"' + res[j + 1] + '",';
            }
        }
        text += '"quantity":"' + this.quantity + '"}';
        var obj = JSON.parse(text);
        for (let item in this.product.product.variations) {
            if (this.product.product.variations[item].id == obj.variation_id) {
                this.product.product.in_stock = this.product.product.variations[item].in_stock;
                this.product.product.price = this.product.product.variations[item].price;
            }
        }
    }
    updateCart(a) {
        this.disableSubmit= false;
        this.values.count += parseInt(this.quantity);
        this.AddToCart = "AddToCart";
    }
    getCart() {
        this.nav.push('CartPage');
    }
    buyNow(id) {
        var text = '{';
        var i;
        for (i = 0; i < this.options.length; i++) {
            var res = this.options[i].split(":");
            text += '"' + res[0] + '":"' + res[1] + '",';
        }
        text += '"product":"' + id + '",';
        text += '"qty":"' + this.quantity + '"}';
        var obj = JSON.parse(text);
        this.nav.push('CartPage', obj);
    }
    mySlideOptions = {
        initialSlide: 1,
        loop: true,
        autoplay: 5800,
        pager: true
    }
    getReviews() {
        this.service.getReviews(this.id)
            .then((results) => this.handleReview(results));
    }
  handleReview(a){
    this.reviews = a;
    for(let item in this.reviews.product_reviews){
       this.reviews.product_reviews[item].avatar = md5(this.reviews.product_reviews[item].reviewer_email);
       console.log(this.reviews.product_reviews[item].avatar);
    }
  }

  addToWishlist(id){
      if(this.values.isLoggedIn){
      this.service.addToWishlist(id)
        .then((results) => this.update(results));
    }
    else{
            this.functions.showAlert("Warning", "You must login to add product to wishlist");
        }


  }

  update(a){
    if(a.success == "Success"){
        //this.functions.showAlert(a.success, a.message);
       this.values.wishlistId[this.product.product.id] =  true;
    }

    else {
        this.functions.showAlert("error", "error");
      }

  }

  removeFromWishlist(id){
    this.values.wishlistId[id] = false;
    this.service.deleteItem(id)
    .then((results) => this.updateWish(results, id));
 
    }

    updateWish(results, id){

        if(results.status == "success"){

            this.values.wishlistId[id] = false;
        
        }

    }
}
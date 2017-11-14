import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { LoadingController } from 'ionic-angular';
import { Config } from './config';
import { Values } from './values';
import { URLSearchParams } from '@angular/http';
import { NativeStorage } from '@ionic-native/native-storage';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/forkJoin';

var headers = new Headers();
headers.append('Content-Type', 'application/x-www-form-urlencoded');

@Injectable()
export class Service {
    data: any;
    url: any;
    categories: any;
    banners: any;
    orders: any;
    order: any;
    isloggedIn: any;
    status: any;
    address: any;
    headers: any;
    products: any;
    product: any;
    cart: any;
    configuration: any;
    loader: any;
    loginStatus: any;
    mainCategories: any;
    country: any;
    user: any;
    login_nonce: any;
    dir: any = 'left';
    recargar: boolean=false;
    constructor(private http: Http, private config: Config, private values: Values, 
        public loadingCtrl: LoadingController, private nativeStorage: NativeStorage) {
        this.url = this.config.url;
        this.mainCategories = [];
    }
    load() {
        this.recargar=false;
        //this.presentLoading(this.values.lan.WaitTitle);
        return new Promise(resolve => {
            this.http.get(this.url + '/wp-admin/admin-ajax.php?action=mstoreapp-keys').map(res => res.json())
                .subscribe(data => {
                    console.log("Cargar categorias");
                    this.config.consumerKey = data.keys.consumerKey;
                    this.config.consumerSecret = data.keys.consumerSecret;
                    // Ver en la consola el numero de consumidor de la app
                    //console.log('ConsumerKey' + data.currency);
                    this.values.currency = data.currency;
                    this.login_nonce = data.login_nonce;
                    this.banners = data.banners;
                    this.banners = data.banners;
                    if (data.user.data != undefined) {
                        this.values.isLoggedIn = data.user.data.status;
                        this.values.customerId = data.user.data.ID;
                        this.values.customerName = data.user.data.user_nicename;
                        this.values.logoutUrl = this.encodeUrl(data.user.data.url);
                    }
                    this.http.get(this.config.setUrl('GET', '/wc-api/v3/products/categories?', false)).map(res => res.json())
                        .subscribe(data => {
                            //this.dismissLoading();
                            this.categories = data;
                            //console.log(this.categories);
                            for (var i = 0; i < this.categories.product_categories.length; i++) {
                                if (this.categories.product_categories[i].parent == '94') {
                                    this.mainCategories.push(this.categories.product_categories[i]);
                                }
                            }
                            this.nativeStorage.getItem('loginData')
                                .then(
                                    data => this.login(data, this.login_nonce),
                                    error => console.error(error)
                                );
                            this.http.get(this.url + '/wp-admin/admin-ajax.php?action=mstoreapp-cart').map(res => res.json())
                                .subscribe(data => {
                                    this.cart = data;
                                    this.values.updateCart(this.cart);
                                });
                            resolve(this.categories);
                        });
                }, err => {
                            console.log("Error cargando");
                            this.recargar = true;
                        });
        });
    }
    getNonce() {
        return new Promise(resolve => {
            this.http.get(this.url + '/wp-admin/admin-ajax.php?action=mstoreapp-nonce').map(res => res.json())               
            .subscribe(data => {
                    console.log("data here ", data);
                    resolve(data);
                });
        });
    }
    login(a, nonce) {
        var params = new URLSearchParams();
        params.append("username", a.username);
        params.append("password", a.password);
        params.append("_wpnonce", nonce);
        params.append("login", 'Login');
        params.append("redirect", this.url + '/wp-admin/admin-ajax.php?action=mstoreapp-userdata');
        return new Promise(resolve => {
            this.http.post(this.url + '/wp-admin/admin-ajax.php?action=mstoreapp-login', params).map(res => res.json())                
                .subscribe(data => {
                    console.log ("login", data)
                    if (!data.errors) {
                        this.values.isLoggedIn = data.data.status;
                        this.values.customerName = data.data.user_nicename;
                        this.values.customerId = data.data.ID;
                        this.values.logoutUrl = this.encodeUrl(data.data.url);
                        params = new URLSearchParams();
                        params.append("customer_id", this.values.customerId.toString());
                        this.http.post(this.url + '/wp-admin/admin-ajax.php?action=mstoreapp-get_wishlist', params).map(res => res.json())
                            .subscribe(data => {
                                for (let item in data) {
                                    this.values.wishlistId[data[item].id] = data[item].id;
                                }
                        });
            params = new URLSearchParams();
            params.append("customer_id", this.values.customerId.toString());
            this.http.post(this.url + '/wp-admin/admin-ajax.php?action=mstoreapp-get_wishlist', params).map(res => res.json())
                .subscribe(data => {
                    
                    console.log(data);
            });
                        this.nativeStorage.setItem('loginData', {
                                username: a.username,
                                password: a.password
                            })
                            .then(
                                data => console.log('Login Details Stored'),
                                error => console.error("Eror Login Storage", error)
                            );
                    }
                    resolve(data);
                }, err => {resolve(JSON.parse(err._body));console.log("Error cargando", err._body)});
        });
    }
    encodeUrl(href) {
        return href.replace(/&amp;/g, '&')
    }
    logout() {
        return new Promise(resolve => {
            this.http.get(this.encodeUrl(this.values.logoutUrl))
                .subscribe(data => {
                    this.values.isLoggedIn = false;
                    this.values.customerName = "";
                    this.http.get(this.url + '/wp-admin/admin-ajax.php?action=mstoreapp-cart').map(res => res.json())
                        .subscribe(data => {
                            this.cart = data;
                            this.values.updateCart(this.cart);
                        });
                    resolve(this.cart);
                });
        });
    }
    passwordreset(email, nonce, url) {
        var params = new URLSearchParams();
        params.append("user_login", email);
        params.append("wc_reset_password", "true");
        params.append("_wpnonce", nonce);
        params.append("_wp_http_referer", '/my-account/lost-password/');
        return new Promise(resolve => {
            this.http.post(this.url + '/my-account/lost-password/', params)
                .subscribe(status => {
                    resolve(status);
                });
        });
    }
    passwordResetNonce() {
        return new Promise(resolve => {
            this.http.get(this.url + '/wp-admin/admin-ajax.php?action=mstoreapp-passwordreset').map(res => res.json())
                .subscribe(data => {
                    resolve(data);
                });
        });
    }
    getAddress() {
        return new Promise(resolve => {
            this.http.get(this.config.setUrl('GET', '/wc-api/v3/customers/' + this.values.customerId + '?', false)).map(res => res.json())
                .subscribe(data => {
                    this.address = data;
                    resolve(this.address);
                });
        });
    }
    saveAddress(address) {
        var params = {
            customer: address
        };
        return new Promise(resolve => {
            this.http.put(this.config.setUrl('PUT', '/wc-api/v3/customers/' + this.values.customerId + '?', false), params).map(res => res.json())
                .subscribe(data => {
                    this.products = data;
                    resolve(this.products);
                });
        });
    }
    pushNotification(notification){
        var params = new URLSearchParams();
        params.append("device_id", notification.device_id);
        params.append("platform", notification.platform);
        params.append("email", notification.email);
        params.append("city", notification.city);
        params.append("state", notification.state);
        params.append("country", notification.country);
        params.append("pincode", notification.pincode);

        return new Promise(resolve => {
            this.http.post(this.url + '/wp-admin/admin-ajax.php?action=mstoreapp-user-subcribe-notify', params, {
                    headers: headers
                }).map(res => res.json())
                .subscribe(data => {
                    this.status = data;
                    resolve(this.status);
                });
        });

    }
    pushNotify(deviceId, platform){
        var params = new URLSearchParams();
            params.append("device_id", deviceId);
            params.append("platform", platform);

            return new Promise(resolve => {
                this.http.post(this.url + '/wp-admin/admin-ajax.php?action=mstoreapp-user-subcribe-notify', params, {
                        headers: headers
                    }).map(res => res.json())
                    .subscribe(data => {
                        this.status = data;
                        resolve(this.status);
                    });
            });

    }
    getOrder(id) {
        return new Promise(resolve => {
            this.http.get(this.config.setUrl('GET', '/wc-api/v3/orders/' + id + '?', false)).map(res => res.json())
                .subscribe(data => {
                    this.order = data;
                    resolve(this.order);
                });
        });
    }
    getCountry() {
        return new Promise(resolve => {
            this.http.get(this.url + '/wp-admin/admin-ajax.php?action=mstoreapp-get_country').map(res => res.json())
                .subscribe(data => {
                    this.country = data;
                    resolve(this.country);
                });
        });
    }
    registerCustomer(customer) {
        var params = {
            customer: customer
        };
        console.log(params);
        return new Promise(resolve => {
            this.http.post(this.config.setUrl('POST', '/wc-api/v3/customers?', false), params).map(res => res.json())
                .subscribe(data => {
                    this.user = data;
                    resolve(this.user);
                }, err => {resolve(JSON.parse(err._body));console.log(err._body)});
        });
    }

    getOrders(filter) {
        return new Promise(resolve => {
            this.http.get(this.config.setUrl('GET', '/wc-api/v3/orders?', filter)).map(res => res.json())
                .subscribe(data => {
                    this.orders = data;
                    resolve(this.orders);
                });
        });
    }
    updateOrder(data, id) {
        return new Promise(resolve => {
            this.http.put(this.config.setUrl('PUT', '/wc-api/v3/orders/' + id + '?', false), data).map(res => res.json())
                .subscribe(data => {
                    this.status = data;
                    resolve(this.status);
                });
        });
    }
    presentLoading(text) {
        this.loader = this.loadingCtrl.create({
            content: text,
        });
        this.loader.present();
    }
    dismissLoading() {
        this.loader.dismiss();
    }
}
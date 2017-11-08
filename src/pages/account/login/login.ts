import { Component } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';
import { Service } from '../../../providers/service/service';
import { Functions } from '../../../providers/service/functions';
import { Values } from '../../../providers/service/values';
import { Home } from '../../home/home';

@IonicPage()
@Component({
    templateUrl: 'login.html'
})
export class AccountLogin {
    loginData: any;
    loadLogin: any;
    status: any;
    error: any;
    nonce: any;
    public disableSubmit: boolean = false;
    buttonText: any;
    modoprueba: boolean = false;
    constructor(public nav: NavController, public service: Service, public functions: Functions, public values: Values) {
        this.loginData = [];
        this.buttonText = "Login";
        if(window.location.hostname === "localhost"){
            this.modoprueba = true;
        }
        this.service.getNonce()
            .then((results) => this.nonce = results);
    }
    login(a) {
        if (this.validateForm()) {
            this.disableSubmit = true;
            this.buttonText = "Logging In...";
            this.service.login(a, this.nonce.checkout_login)
                .then((results) => this.handleResults(results));
        }
    }
    validateForm() {
        if (this.loginData.username == undefined || this.loginData.username == "") {
            return false
        }
        if (this.loginData.password == undefined || this.loginData.password == "") {
            return false
        }
        else {
            return true
        }
    }
    handleResults(results) {
        this.disableSubmit = false;
        this.buttonText = "Login";

        
        if (!results.errors) {
            this.functions.showAlert('Exito', 'Has iniciado sesión con éxito.');
            this.nav.setRoot(Home);
        }
        else if (results.errors) {
            this.functions.showAlert('Error', 'Usucario/Contraseña incorrectos.');
        }
    }
    forgotten(loginData) {
        this.nav.push('AccountForgotten');
    }
}
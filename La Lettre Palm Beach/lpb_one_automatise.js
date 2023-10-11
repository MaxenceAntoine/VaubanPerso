function Choice(id, index, stackLetter, paymentMethod, starting_price_duration, renewal_term_length, starting_price,
    default_price, auto_renew, customHtml) {
    this.id = id;
    this.index = index;
    this.stackLetter = stackLetter
    this.paymentMethod = paymentMethod;
    this.renewal_term_length = renewal_term_length;
    this.default_price = default_price;
    this.auto_renew = auto_renew;
    this.customHtml = customHtml;


    if (starting_price_duration == 0) {
        this.starting_price = default_price;
        this.starting_price_duration = renewal_term_length;
    } else {
        this.starting_price = starting_price;
        this.starting_price_duration = starting_price_duration;
    }

    try {
        this.customHtml = JSON.parse(customHtml);
        this.old_price = this.customHtml.old_price;
    } catch (error) {
        this.customHtml = "";
        this.old_price = null;
    }

    /**
     * Fonction qui permet de savoir si il y a une des mois offerts avant un renouvelllement payant
     **/
    Choice.prototype.isFreeWithPaidRenewal = function () {
        if (this.starting_price == 0 && this.starting_price_duration != 0 && this.default_price != 0 && this
            .auto_renew == 1) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Fonction qui permet de savoir si c'est une offre life
     **/
     Choice.prototype.isLife = function () {
        if ((this.starting_price > 500 && this.default_price == 99 || this.starting_price > 300 && this
                .default_price == 19) && this.starting_price_duration == 12 && this.renewal_term_length == 12 &&
            this.auto_renew == 1) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Fonction qui permet de savoir si il y a un ou plusieurs mois gratuit dans l'offre
     **/
    Choice.prototype.isFreeMonth = function () {
        if (this.starting_price == 0 && this.starting_price_duration > 0) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Fonction qui permet de savoir si il y a un ou plusieurs mois gratuit dans l'offre
     **/
     Choice.prototype.isTrialMonth = function () {
        if (this.starting_price == 1 && this.default_price > 1) {
            return true;
        } else {
            return false;
        }
    };



    /**
     * Fonction qui retourne la durée de renouvellement du choice
     **/
    Choice.prototype.duration = function (genre = 0) {
        if (this.isLife()) {
            return "à vie";
        } else {
            return convertToDuration(this.renewal_term_length, genre);
        }
    };

    /**
     * Fonction qui retourne la durée de renouvellement du choice de base
     **/
    Choice.prototype.startDuration = function (genre = 0) {
        if (this.isLife()) {
            return "à vie";
        } else if (this.isFreeMonth()) {
            if(this.starting_price_duration > 1 ){
                return convertToDuration(this.renewal_term_length, genre) + ` avec ` + this
                .starting_price_duration +
                ` mois gratuits`;
            }else{
                return convertToDuration(this.renewal_term_length, genre) + ` avec ` + this
                .starting_price_duration +
                ` mois gratuit`;
            }
        } else if (this.isTrialMonth()){
            return convertToDuration(this.renewal_term_length, genre) + ` avec ` + this
                .starting_price_duration +
                ` mois d'essai`;
        } else {
            return convertToDuration(this.starting_price_duration, genre);
        }
    };

    /**
     * Fonction qui retourne le header du choice
     **/
    Choice.prototype.printHeader = function () {
        if (this.isLife()) {
            return "à vie";
        } else if (this.isFreeMonth()) {
            return "gratuit";
        } else if (this.isTrialMonth()){
            return this.starting_price_duration + " mois d'essai";
        } else {
            return convertToDuration(this.starting_price_duration);
        }
    };

    /**
     * Fonction qui retourne l'offre du choice avec el logo en fonction du moyen de paiement
     **/
    Choice.prototype.printOffre = function () {
        var affichage = "";
        var url_logo = "";
        var text = "";
        if (this.paymentMethod == "sepa") {
            text = "Paiement par prélèvement";
            url_logo = "https://vauban-cdn.pubfac.io/bdc/sepa-logo.png"
        } else {
            text = "Paiement par Carte de Crédit";
            url_logo = "https://vauban-cdn.pubfac.io/bdc/cc-logo.png"
        }

        if (this.isLife()) {
            affichage = "Offre à vie"
        } else if (this.isFreeMonth()) {
            if( this.starting_price_duration > 1){
                affichage = this.starting_price_duration + " mois gratuits";
            }else{
                affichage = this.starting_price_duration + " mois gratuit";
            }
        } else if (this.isTrialMonth()) {
            affichage = "Testez pendant " + this.starting_price_duration + " mois";
        } else {
            affichage = `<p>Offre `+ this.starting_price_duration + `</p><p>`
            + this.starting_price.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR"
              }); + `</p>`
        }
        return `<p><strong>` + text + `</strong><br><img
                          style="max-width: 200px; width:100%; display: block; margin-left: auto; margin-right: auto;"
                          src="` + url_logo + `"> <br> ` + affichage;
    };

    /**
     * Fonction qui retourne l'affichage de l'ancien prix (rien si pas d'info)
     **/
    Choice.prototype.printOldPrice = function () {
        return this.old_price ? `<p style="text-decoration: line-through;; color: red; font-weight: 600; margin-bottom: 0px !important;">
                      ` + this.old_price + `&nbsp;€</p>` : `<p class="d-none" style="margin-bottom: 0px !important;">&nbsp;</p>`;
    };


    /**
     * Fonction qui retourne l'affichage de l'ancien prix (rien si pas d'info)
     **/
     Choice.prototype.price = function () {
        var affichage = `<span class="price mb-4">`;
        if (this.isFreeMonth()) {
            if (this.starting_price_duration > 1){
                affichage =+ this.starting_price_duration + " mois gratuits à "+this.starting_price+"&nbsp;€</span>";
            }else{
                affichage =+ this.starting_price_duration + " mois gratuit à "+this.starting_price+"&nbsp;€</span>";
            }
        }
        else if(this.isTrialMonth()){
            if (this.starting_price_duration > 1){
                affichage =+this.starting_price_duration + " mois d'essais à "+this.starting_price+"&nbsp;€</span>";
            }else{
                affichage =+this.starting_price_duration + " mois d'essai à "+this.starting_price+"&nbsp;€</span>";
            }
        }
        else if(this.old_price == null){
            affichage = `<span class="currency" style="color: red;">` + this.starting_price + `&nbsp;€ </span>TTC</span>`;
        }
        else {
            affichage = `<span class="currency">` + this.starting_price + `&nbsp;€ </span>TTC</span>`;
        }
        return affichage;
    };
    

    /**
     * Fonction qui retourne l'affichage du récapitulatif
     **/
    Choice.prototype.printRecapitulatif = function () {


        return ` <h4 class="text-uppercase" >>OFFRE ` + this.startDuration(1) + `</h4>
                    <p>Je comprends que cette offre spéciale me permet de bénéficier des conseils, des dossiers cadeaux. De plus, je reçois toutes les alertes par email ainsi que mon accès au portefeuille modèle en ligne (14 jours après mon inscription). Je souscris à un abonnement `
                     + this.startDuration() +
            ` au tarif de ` + config_bdc.auteur +
            ` et bénéficie de l’offre exceptionnelle d'abonnement `
            + this.starting_price.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR"
              }) + ` par ` 
              + this.printMoyenPaiement() + 
              `. Afin de vous fournir un service sans interruption, le renouvellement est automatique. A la fin de votre abonnement, vous serez donc débité de `
            + this.default_price.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR"
              }) +
            `, et ainsi de suite jusqu'à ce que vous demandiez l'arrêt de ce dernier. Pour demander le non renouvellement, il vous suffit de nous joindre via le formulaire de contact.</p>`
    };



    /**
     * Fonction qui retourne l'affichage du moyen de renouvellement
     **/
    Choice.prototype.printRenouvellement = function () {
        var affichage = "<div><p>Renouvellement</p><p>AUTOMATIQUE</p>";
        if (this.isLife()) {
            //Dans le cas d'une offre à vie 
            return "Frais de maintenance à " + this
                .default_price + "&nbsp;€ par " + convertToDurationBis(this.renewal_term_length);
        } else {
            if (this.isFreeMonth() || this.starting_price_duration != this.renewal_term_length) {
                //Dans le cas où c'est un freemonth ou une durée de renouvellement différent de la durée initiale
                return "Renouvellement " + convertToDuration(this
                    .renewal_term_length) + " automatique à " + this.default_price + "&nbsp;€";
            } else if (this.starting_price != this.default_price) {
                //Dans le cas où c'est un freemonth ou une durée de renouvellement différent de la durée initiale
                return "Renouvellement automatique à " + this.default_price + "&nbsp;€";
            }
            return "Renouvellement automatique";
        }

    };

    /**
     * Fonction qui retourne l'affichage du bandeau de promotion
     **/
    Choice.prototype.printBandeau = function () {
        var affichage = "";
        if (this.isLife()) {
            //Dans le cas d'une offre à vie 
            affichage = "Offre à vie"
        } else if (this.isFreeMonth()) {
            if(this.starting_price_duration > 1 ){
                affichage = this.starting_price_duration + " mois gratuits";
            }else{
                affichage = this.starting_price_duration + " mois gratuit";
            }
        } else if (this.starting_price != this.default_price && this.old_price && this
            .starting_price_duration == this.renewal_term_length) {
            affichage = this.starting_price_duration + " mois avec " + Math.round(100 - (this.starting_price *
                    100 / this.old_price)) +
                `% de réduction`;
        } else {
            //Si il y a ancien prix -> Calcul la remise Sinon affiche "Offre spéciale" 
            affichage = this.old_price ? Math.round(100 - (this.starting_price * 100 / this.old_price)) +
                `% de réduction` : "Offre spéciale";
        }
        return `<p style="background-color:green; color:white; padding:5px;">` + affichage + `</p>`;

    };


    Choice.prototype.printMoyenPaiement = function () {
        if (this.paymentMethod == 'sepa') {
            return "mandat SEPA";
        } else {
            return "carte de crédit";
        }

    };

}

document.addEventListener("falcon-ready", function () {
    // Créez un tableau vide pour stocker les données JSON
    var choices = []; // Crée un tableau vide pour les choices
    // Sélectionnez tous les boutons avec l'attribut "data-type" égal à "direct"
    const boutonsDirect = $('[data-type="direct"]');
    // Parcourez la liste des boutons direct
    boutonsDirect.each(function() {
        // Récupérez la valeur de l'attribut "data-order-form-code" de chaque bouton
        const choice_div = $(this);
        const orderFormCode = $(this).attr('data-order-form-code');
        var id_choice = $(this).attr('data-order-form-choice-id');
        // Créez l'URL pour la requête JSON en utilisant la valeur de "orderFormCode"
        const jsonUrl = `https://secure.la-lettre-palm-beach.com/${orderFormCode}/order-form/config.json`;
        // Effectuez la requête JSON
        $.ajax({
            url: jsonUrl,
            dataType: 'json',
            success: function(data) {
                // Ajoutez les données JSON au tableau
                data.choices.forEach(function (choice, index) {
                    if(choice.id == id_choice){
                        var choice_now = new Choice(choice.id, index + 1, choice.stackLetter, choice.paymentMethod,
                            choice.startingPriceDuration,
                            choice.renewalTermLength, choice.startingPrice, choice.defaultPrice, choice
                            .isBcl, choice.customHtml);
                        // Sélectionnez le bouton par son identifiant et stockez-le dans une variable
                        
                        var divParent = choice_div.parent();
                        divParent.addClass("div_one");
                        divParent.prepend(`<div id="ikan" class="row"><div id="it91" class="d-flex align-items-center col-md-8 col-sm-12 col-xs-12"><div data-text-code="" id="ifcu"><ul id="pay">
                        <li style="color: darkgreen; font-weight: bold;">
                          <strong>Payer facilement</strong>
                        </li>
                      </ul></div></div><div class="col-md-4 col-xs-12 col-sm-12"><img src="https://cdn.les-investisseurs.com/uploads/CRYPTAGE-SSL.png" id="i9s0"></div></div>`);
                        divParent.prepend("<p>Moyen de Paiement "+choice_now.paymentMethod+"</p>");
                         
                        choices.push(choice_now);
                    }
            
                });
                window.choices_window = choices;
                // Utilisez la méthode .parent() pour récupérer la div parent
            },
            error: function(xhr, status, error) {
                // Gestion des erreurs ici
                console.error(status, error);
            }
        });
    });
});
  
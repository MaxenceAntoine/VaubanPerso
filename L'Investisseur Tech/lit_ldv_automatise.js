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
    }
    else {
        this.starting_price = starting_price;
        this.starting_price_duration = starting_price_duration;
    }
    try {
        this.customHtml = JSON.parse(customHtml);
        this.old_price = this.customHtml.old_price;
    }
    catch (error) {
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
        }
        else {
            return false;
        }
    };

    /**
    * Fonction qui permet de savoir si c'est un choice SEPA ou CC
    **/
    Choice.prototype.isSepa = function () {
        if (this.paymentMethod == "sepa") {
            return true;
        }
        else {
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
        }
        else {
            return false;
        }
    };

    /**
    * Fonction qui permet de savoir si il y a un ou plusieurs mois gratuit dans l'offre
    **/
    Choice.prototype.isFreeMonth = function () {
        if (this.starting_price == 0 && this.starting_price_duration > 0) {
            return true;
        }
        else {
            return false;
        }
    };

    /**
    * Fonction qui permet de savoir si il y a un ou plusieurs mois gratuit dans l'offre
    **/
    Choice.prototype.isTrialMonth = function () {
        if (this.starting_price == 1 && this.default_price > 1) {
            return true;
        }
        else {
            return false;
        }
    };

    /**
    * Fonction qui retourne la durée de renouvellement du choice
    **/
    Choice.prototype.duration = function (genre = 0) {
        if (this.isLife()) {
            return "à vie";
        }
        else {
            return convertToDuration(this.renewal_term_length, genre);
        }
    };

    /**
    * Fonction qui retourne la durée de renouvellement du choice de base
    **/
    Choice.prototype.startDuration = function (genre = 0) {
        if (this.isLife()) {
            return "à vie";
        }else if (this.isFreeMonth()) {
            if(this.starting_price_duration > 1 ){
                return convertToDuration(this.renewal_term_length, genre) + ` avec ` + this
                .starting_price_duration +
                ` mois gratuits`;
            }else{
                return convertToDuration(this.renewal_term_length, genre) + ` avec ` + this
                .starting_price_duration +
                ` mois gratuit`;
            }
        }else if (this.isTrialMonth()){
            return convertToDuration(this.renewal_term_length, genre) + ` avec ` + this
            .starting_price_duration +
            ` mois d'essai`;
        }else {
            return convertToDuration(this.starting_price_duration, genre);
        }
    };

    /**
    * Fonction qui retourne l'affichage de l'ancien prix (rien si pas d'info)
    **/
    Choice.prototype.price = function () {
        var affichage = `<span class="price mb-4">`;
        if (this.isFreeMonth()) {
            if (this.starting_price_duration > 1){
                affichage =+ this.starting_price_duration + " mois gratuits à "+this.starting_price+"&nbsp;€</span>";
            }
            else{
                affichage =+ this.starting_price_duration + " mois gratuit à "+this.starting_price+"&nbsp;€</span>";
            }
        }else if(this.isTrialMonth()){
            if (this.starting_price_duration > 1){
                affichage =+this.starting_price_duration + " mois d'essais à "+this.starting_price+"&nbsp;€</span>";
            }else{
                affichage =+this.starting_price_duration + " mois d'essai à "+this.starting_price+"&nbsp;€</span>";
            }
        }else if(this.old_price == null){
            affichage = `<span class="currency" style="color: red;">` + this.starting_price + `&nbsp;€ </span>TTC</span>`;
        }else {
            affichage = `<span class="currency">` + this.starting_price + `&nbsp;€ </span>TTC</span>`;
        }
        return affichage;
    };

    /**
    * Fonction qui retourne l'affichage du récapitulatif
    **/
    Choice.prototype.printRecapitulatif = function () {
        return `<h4 class="text-uppercase">Offre `+this.startDuration(1)+`</h4>
        <div style="font-size: 12px;color:#3b4147;" class="mb-4">
        <p>Je comprends que cette offre spéciale me permet de bénéficier des éditions mensuelles et dossiers cadeaux. De plus, je reçois toutes les alertes par email ainsi que mon accès au portefeuille-modèle en ligne. Je souscris à un abonnement `+this.startDuration()+` au tarif de `+this.starting_price.toLocaleString("fr-FR", {
        style: "currency",currency: "EUR"}
        )+` TTC.</p>
        <p>Renouvellement automatique : vous serez débité de `+this.default_price.toLocaleString("fr-FR", {
        style: "currency",currency: "EUR"}
                                                                                    )+` par ` + convertToDurationBis(this.renewal_term_length) + ` avec votre ` + this.printMoyenPaiement() + `. Dans le but de vous offrir une qualité de service sans interruption, vous bénéficiez d'un renouvellement automatique de votre abonnement. Vous pouvez demander le non renouvellement de celui-ci par simple demande via notre formulaire de contact.</p></div>`
    };

    /**
    * Fonction qui retourne l'affichage du moyen de renouvellement
    **/
    Choice.prototype.printRenouvellement = function () {
        var affichage = "";
        if (this.isLife()) {
            //Dans le cas d'une offre à vie 
            return "Frais de maintenance à " + this
            .default_price + "&nbsp;€ par " + convertToDurationBis(this.renewal_term_length);
        }
        else {
            return "Renouvellement " + convertToDuration(this.renewal_term_length) + " automatique à " + this.default_price + "&nbsp;€";
        }
    };

    /**
    * Fonction qui retourne le libélé du moyen de paiement
    **/
    Choice.prototype.offreSpeciale = function () {
        if (this.starting_price_duration != this.renewal_term_length) {
            if(this.starting_price_duration == 1){
                return "<p>le premier mois</p>";
            }
            else if(this.starting_price_duration == 12){
                return "<p>la première année</p>";
            }else{
                return "<p>les "+this.starting_price_duration+" premiers mois</p>";

            }
        }
        return "";
    };

    /**
    * Fonction qui retourne le libélé du moyen de paiement
    **/
    Choice.prototype.printMoyenPaiement = function () {
        if (this.paymentMethod == 'sepa') {
            return "mandat SEPA";
        }
        else {
        return "carte de crédit";
        }
    };
}
function convertToDuration(number, genre = 0) {
    let duration;
    switch (number) {
    case 1:
    genre == 0 ? duration = 'mensuel' : duration = 'mensuelle';
    break;
    case 2:
    genre == 0 ? duration = 'bimensuel' : duration = 'bimensuele';
    duration = 'bimensuel';
    break;
    case 3:
    genre == 0 ? duration = 'trimestriel' : duration = 'trimestrielle';
    break;
    case 6:
    genre == 0 ? duration = 'semestriel' : duration = 'semestrielle';
    break;
    case 12:
    genre == 0 ? duration = 'annuel' : duration = 'annuelle';
    break;
    case 24:
    genre == 0 ? duration = 'biennal' : duration = 'biennalle';
    break;
    case 36:
    genre == 0 ? duration = 'de 3 ans' : duration = 'de 3 ans';
    break;
    default:
    duration = 'durée inconnue';
    break;
    }
    return duration;
}
function convertToDurationBis(number) {
    let duration;
    switch (number) {
    case 1:
    duration = 'mois';
    break;
    case 2:
    duration = '';
    break;
    case 3:
    duration = 'trimestre';
    break;
    case 6:
    duration = 'semestre';
    break;
    case 12:
    duration = 'an';
    break;
    case 24:
    duration = '2 ans';
    break;
    case 36:
    duration = '3 ans';
    break;
    default:
    duration = 'durée inconnue';
    break;
    }
    return duration;
}


function printPrice(price){
    var regex = /^\d+$/
    if(regex.test(price)){
        return price+"&nbsp;€";
    }
    else{
        return price.toLocaleString("fr-FR", {style: "currency",currency: "EUR"});
    }
}

function getDataId($element) {
    var ccId = $element.attr('data-1c-cc-id');
    var sepaId = $element.attr('data-1c-sepa-id');
    if (ccId !== undefined) {
        return ccId;
    }
    else if (sepaId !== undefined) {
        return sepaId;
    }
    else {
        return null;
        // Ou une valeur par défaut, ou gérer le cas où aucun attribut n'est trouvé
    }
}
document.addEventListener("falcon-ready", function () {
    let urlArrivee = new URL(window.location.href);
    //création d'une nouvelle variable de l'url de la page
    let search_params = urlArrivee.searchParams;
    //recherche des paramètres du lien
    let sepa = search_params.get('1c_sepa');
    let cc = search_params.get('1c_cc');
    if (sepa == "True" || cc == "True") {
        $('.bdc').addClass("d-none");
        console.log("$('.bdc').addClass();")
    }
    else {
        $('.sepa-or-cc').addClass("d-none");
        console.log("$('.sepa-or-cc').addClass();")
    }
    // Créez un tableau vide pour stocker les données JSON
    var choices = [];
    var colorChoice = ["red","green","blue"];
    var nbchoiceSEPA = 0;
    var nbchoiceCC = 0;
    console.log("TEST");
    // Crée un tableau vide pour les choices
    // Sélectionnez tous les boutons avec l'attribut "data-type" égal à "direct"
    const boutonsDirect = $('[data-type-link="1c_sepa-or-1c_cc"]');
    // Parcourez la liste des boutons direct
    boutonsDirect.each(function() {
        // Récupérez la valeur de l'attribut "data-order-form-code" de chaque bouton
        const choice_div = $(this);
        const orderFormCode = $(this).attr('data-order-form-code');
        var id_choice = getDataId($(this));
        // Créez l'URL pour la requête JSON en utilisant la valeur de "orderFormCode"
        const jsonUrl = `https://secure.vauban-editions.com/${orderFormCode}/order-form/config.json`;
        // Effectuez la requête JSON
        console.log("jsonUrl: "+jsonUrl);
        console.log("id_choice: "+id_choice);
        $.ajax({
            url: jsonUrl,
            dataType: 'json',
            success: function(data) {
                // Ajoutez les données JSON au tableau
                var choice_size = "col-md-12";
                switch (data.choices.length) {
                case 2:
                choice_size = "col-md-5";
                break;
                case 4:
                choice_size = "col-md-5";
                break;
                case 6:
                choice_size = "col-md-3";
                break;
                default:
                choice_size = "col-md-12";
                break;
                }
                data.choices.forEach(function (choice, index) {
                    if(choice.id == id_choice){
                        var choice_now = new Choice(choice.id, index + 1, choice.stackLetter, choice.paymentMethod,
                                                    choice.startingPriceDuration,
                                                    choice.renewalTermLength, choice.startingPrice, choice.defaultPrice, choice
                                                    .isBcl, choice.customHtml);
                        // Création de la div parent
                        //var divChoice = $(`<div class="block-offre col-sm-12 my-2 `+choice_size+` text-center"></div>`);
                        //choice_div.wrap(divChoice);
                        choice_div.parent().removeClass();
                        choice_div.parent().addClass(`col-sm-12 my-2 `+choice_size+` text-center`);
                        choice_div.parent().css("box-shadow", "0 3px 3px 3px #acacac");
                        choice_div.parent().css("border-radius", "5px 5px 0 0");
                        choice_div.parent().css("padding-right", "calc(var(--bs-gutter-x)*-0.5)");
                        choice_div.parent().css("padding-left", "calc(var(--bs-gutter-x)*-0.5)");
                        choice_div.parent().parent().addClass(`justify-content-around`);
                        // Création de la div au-dessus du bouton
                        var colorChoice = choice_now.paymentMethod === "sepa" ? config.colorChoice[nbchoiceSEPA] : config.colorChoice[nbchoiceCC] ;
                        var divAuDessus = $(`<div style="background-color: `+colorChoice+`; color: #ffffff;" class="py-4">
                            <p style="font-size: 16px;">OFFRE</p>
                            <h3 class="fs-4 text-uppercase">`+choice_now.duration(1)+`</h3>
                            <h2><strong>`+choice_now.starting_price+`<sup>€</sup></strong></h2>`+choice_now.offreSpeciale()+`
                            </div>
                            <div class="my-3 px-2">
                            <p style="font-size: 14px;color:#6e7882;">Renouvellement</p>
                            <p style="font-size: 16px;" class="mb-2">`+choice_now.printRenouvellement()+`</p>
                            <p style="font-size: 14px;color:#6e7882;">Cadeaux</p>
                            <p style="font-size: 16px;">Dossiers + Accès Portefeuille</p>
                        `);
                        // Utilisez un opérateur ternaire pour incrémenter la variable appropriée en fonction du type
                        choice_now.paymentMethod === "sepa" ? nbchoiceSEPA++ : nbchoiceCC++;
                        // Ajout de la div au-dessus du bouton dans la div parent
                        choice_div.before(divAuDessus);
                        choice_div.addClass(`my-3`);
                        choice_div.children().first().html(`Je profite de l'offre en 1 clic`);
                        // Ajout de la div au-dessus du bouton dans la div parent
                        // Ajout du bouton dans la div parent
                        choices.push(choice_now);

                        if(choice_now.isFreeMonth()){
                            choice_div.after(`<span style="color: rgb(184, 49, 47); font-size: 12px;"><p>Attention : paiement en 1clic.</p><p>Cliquer sur le bouton valide votre commande, vous profitez d'un mois gratuit puis serez débité de `+printPrice(choice_now.default_price)+` grâce à votre `+choice_now.printMoyenPaiement()+`</p>`);
                        
                        }else{
                            choice_div.after(`<span style="color: rgb(184, 49, 47); font-size: 12px;"><p>Attention : paiement en 1clic.</p><p>Cliquer sur le bouton vous débitera de `+printPrice(choice_now.starting_price)+` grâce à votre `+choice_now.printMoyenPaiement()+`</p>`);
                        }
                        
                        if((choice_now.isSepa() && sepa == "True") || choice_now.isSepa() == false && cc == "True"){
                            $(".bloc_recap").append(choice_now.printRecapitulatif());
                        }
                    }
                });
                window.choices_window = choices;
                // Utilisez la méthode .parent() pour récupérer la div parent
            },error: function(xhr, status, error) {
                // Gestion des erreurs ici
                console.error(status, error);
            }
        });
    }
            );
    $(".bloc_recap").after(`<p style="font-size: 12px;">
    Vous ne souhaitez pas payer en 1 clic et préférez renseigner vos coordonnées de paiement ? 
    <a class="btn-order-form-button" href="">Cliquez ici pour accéder au bon de commande</a>
    </p>
    <p style="font-size: 12px;">
    En cliquant ci-dessus, je confirme ma commande et j'accepte les <a href="https://www.vauban-editions.com/cgv" target="”_blank”">conditions générales de vente</a>.
    </p>`);
});

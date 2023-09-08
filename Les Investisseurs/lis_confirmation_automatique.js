function Choice(id, classNameIdentifier, productName, index, stackLetter, paymentMethod, starting_price_duration,
    renewal_term_length, starting_price,
    default_price, auto_renew, customHtml, type) {
    this.id = id;
    this.classNameIdentifier = classNameIdentifier;
    this.productName = productName;
    this.index = index;
    this.stackLetter = stackLetter
    this.paymentMethod = paymentMethod;
    this.renewal_term_length = renewal_term_length;
    this.default_price = default_price;
    this.auto_renew = auto_renew;
    this.customHtml = customHtml;
    this.type = type;


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
     * Fonction qui permet de savoir si il s'agit d'un non merci
     **/
    Choice.prototype.isNonMerci = function () {
        return this.classNameIdentifier == "cta-extrasell-2";
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
            return convertToDuration(this.renewal_term_length, genre) + ` avec ` + this
                .starting_price_duration +
                ` mois gratuit`;
        } else {
            return convertToDuration(this.starting_price_duration, genre);
        }
    };


    Choice.prototype.printMoyenPaiement = function () {
        if (this.paymentMethod == 'sepa') {
            return "mandant SEPA";
        } else {
            return "carte de crédit";
        }

    };

    Choice.prototype.printAll = function () {
        if (this.isNonMerci()) {
            return `<div class="w-100 mt-3 no-extrasell btn text-center" style="background-color: red; color: white;">Non merci.</div><hr>`
        } else {
            return `<div class="text-center mt-3 font-weight-bold">
                            <h3 class="text-uppercase"><strong>OFFRE ` + this.startDuration(1) + ` : <em>` + this
                .productName + `</em></strong></h3>
                            ` + this.printAlert() + this.printButton() + this.printPaiement() +
                `</div><hr>`
        }
    }

    /**
     * Fonction qui retourne le prix du choice en fonction de la durée en mois en commentaire
     **/
    Choice.prototype.calculPriceDuration = function (duration = 1) {
        return (this.starting_price + (Math.ceil((duration - this.starting_price_duration) /
                this.renewal_term_length) *
            this.default_price))
    };

    

    Choice.prototype.printButton = function () {
        var textButton;
        if (this.isNonMerci()) {
            return `<div class="w-100 mt-3 no-extrasell btn text-center" style="background-color: red; color: white;">Non merci.</div>`
        } else {
            return `<span class="btn btn-primary ` + this.classNameIdentifier +
                `" style="width: 100%;text-transform: uppercase;background-color:green;border:none;">Je profite d'une offre ` +
                this.startDuration(1) + ` en 1 clic </span>`
        }
    }


    Choice.prototype.printPaiement = function () {
        if (this.type == "crosssell") {
            return `<p>Je paie <span style="color: #38761d;">` + this.starting_price.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR"
                }) +
                `</span> tout de suite (renouvelé à ` + this.default_price.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR"
                }) + ` par ` +
                convertToDurationBis(this.renewal_term_length) + `)`
        } else {
            return `<p>Je paie <span style="color: #38761d;">` + this.starting_price.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR"
                }) +
                `</span> tout de suite pour l’abonnement ` + this.startDuration() + ` au lieu de `+ printPreviousChoice(previous_choice) + ` d'abonnement</p><p>Ensuite, je ne paie que ` + this
                .default_price.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR"
                }) + ` par ` + convertToDurationBis(this.renewal_term_length) +
                ` pour maintenir mon abonnement actif.</p>`;
        }
        return
    }

    Choice.prototype.printAlert = function () {
        var textAlert;
        if (this.type == "crosssell") {
            textAlert = "";
        } else {
            textAlert = "et remplace votre commande précédente";
        }
        return `<p style="color: red;"><em>Attention, cliquer sur le bouton ci-dessous valide la commande ` +
            textAlert + `</em></p>`
    }

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

/**
     * Fonction qui retourne le prix du previous choice de façon écrite
     **/
function printPreviousChoice(previous_choice){
    if (previous_choice.isFreeMonth()) {
        if (previous_choice.starting_price_duration == 1) {
            return `0&nbsp;€ le premier mois puis ` + previous_choice.default_price.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR"
            }) + ` par ` + convertToDurationBis(previous_choice.starting_price_duration)
        }else{
            return `0&nbsp;€ les ` + previous_choice.starting_price + ` mois puis ` + previous_choice.default_price + ` par ` + convertToDurationBis(previous_choice.renewal_term_length)
        }
    } else {
        return previous_choice.starting_price.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR"
        }) + ` par ` + convertToDurationBis(previous_choice
            .starting_price_duration)
    }
};

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

document.addEventListener("vanguard-ready", function () {

    var choices = []; // Crée un tableau vide pour les choices
    window.VANGUARD_LOCAL_CONFIG.choices.forEach(function (choice, index) {
        choices.push(new Choice(choice.id, choice.classNameIdentifier, choice.productName, index +
            1, choice.stackLetter, choice.paymentMethod,
            choice.startingPriceDuration,
            choice.renewalTermLength, choice.startingPrice, choice.defaultPrice, choice
            .isBcl, choice.customHtml, choice.type))

    });

    let previous_choice = JSON.parse(localStorage.PREVIOUS_CHOICE);
    previous_choice = new Choice(previous_choice.choiceId, null, previous_choice.productName, -1,
        previous_choice.stackLetter, previous_choice.paymentMethod, previous_choice
        .startingPriceDuration,
        previous_choice
        .renewalTermLength, previous_choice.startingPrice, previous_choice.defaultPrice, previous_choice
        .isBcl, "");
    window.choices_tab = choices;
    window.previous_choice = previous_choice;
    $.each(choices, function (index, choice) {
        $(".choices").each(function (index, element) {
            $(this).append(choice.printAll());
        });
    });

    // Parcourir chaque balise "publication"
    $("publication").each(function () {
        // Modifier le contenu texte avec la valeur "config.publication"
        $(this).text(config_bdc.publication);
    });

    // Parcourir chaque balise "auteur"
    $("auteur").each(function () {
        // Modifier le contenu texte avec la valeur "config.auteur"
        $(this).text(config_bdc.auteur);
    });

    // Parcourir chaque balise "previous_choice_price"
    $("previous_choice_price").each(function () {
        // Modifier le contenu texte avec la valeur "config.publication"
        $(this).text(previous_choice.starting_price.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR"
        }));
    });

    // Parcourir chaque balise "previous_choice_price"
    $("previous_default_price").each(function () {
        // Modifier le contenu texte avec la valeur "config.publication"
        $(this).text(previous_choice.default_price.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR"
        }));
    });

    $('*').filter(function () {
        // Utilisez une expression régulière pour filtrer les balises qui correspondent au pattern <previous_choice_price_...>
        return this.tagName.match(/^PREVIOUS_CHOICE_PRICE_\d{1,2}$/i);
    }).each(function () {
        // Récupérez le nom de la balise (ex. "PREVIOUS_CHOICE_PRICE_1")
        var tagName = this.tagName;
        // Utilisez une expression régulière pour extraire le nombre entier de la balise
        var number = parseInt(tagName.match(/\d+/)[0], 10);
        // Affichez le nombre entier dans la balise elle-même
        $(this).text(previous_choice.calculPriceDuration(number).toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR"
        }));
        // Vous pouvez faire d'autres opérations avec le nombre ici si nécessaire
    });


    $('*').filter(function () {
        // Utilisez une expression régulière pour filtrer les balises qui correspondent au pattern <previous_choice_price_...>
        return this.tagName.match(/^DIFFERENT_PRICE_\d{1,2}$/i);
    }).each(function () {
        // Récupérez le nom de la balise (ex. "PREVIOUS_CHOICE_PRICE_1")
        var tagName = this.tagName;
        // Utilisez une expression régulière pour extraire le nombre entier de la balise
        var number = parseInt(tagName.match(/\d+/)[0], 10);
        // Affichez le nombre entier dans la balise elle-même
        $(this).text((previous_choice.calculPriceDuration(number) - choices[0].calculPriceDuration(number)).toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR"
        }));
        // Vous pouvez faire d'autres opérations avec le nombre ici si nécessaire
    });
    // Parcourir chaque balise "publication"
    $("previous_choice_duration").each(function () {
        // Modifier le contenu texte avec la valeur "config.publication"
        $(this).text(previous_choice.starting_price_duration);
    });

    // Parcourir chaque balise "publication"
    $("choice_starting_price").each(function () {
        // Modifier le contenu texte avec la valeur "config.publication"
        $(this).text(choices[0].starting_price.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR"
        }));
    });

    // Parcourir chaque balise "publication"
    $("choice_default_price").each(function () {
        // Modifier le contenu texte avec la valeur "config.publication"
        $(this).text(choices[0].default_price.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR"
        }));
    });

    // Parcourir chaque balise "publication"
    $("choice_duration").each(function () {
        // Modifier le contenu texte avec la valeur "config.publication"
        $(this).text(choices[0].starting_price_duration);
    });

});
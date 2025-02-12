function Dossier(title, url_photo, description) {
    this.title = title;
    this.url_photo = url_photo;
    this.description = description;
}


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
            return convertToDuration(this.renewal_term_length, genre) + ` avec ` + this
                .starting_price_duration +
                ` mois gratuit`;
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
            //return "gratuit";
            return convertToDuration(this.renewal_term_length);
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
            affichage = this.starting_price_duration + " mois offert";
        } else if (this.isTrialMonth()) {
            affichage = "Testez pendant " + this.starting_price_duration + " mois";
        } else {
            affichage = this.starting_price_duration + `&nbsp;mois d'abonnement`;
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
        var affichage = "";
        if(this.old_price == null){
            affichage = `<span class="price mb-4"><span class="currency" style="color: red;">` + this.starting_price + `&nbsp;€ </span>TTC</span>`;
        }
        else {
            affichage = `<span class="price mb-4"><span class="currency">` + this.starting_price + `&nbsp;€ </span>TTC</span>`;
        }
        return affichage;
    };
    

    /**
     * Fonction qui retourne l'affichage du récapitulatif
     **/
    Choice.prototype.printRecapitulatif = function () {
        return ` <h4 class="text-uppercase" >OFFRE ` + this.startDuration(1) + `</h4>
                    <p>OUI, je m’inscris à ` + config_bdc.publication +
            ` avec ` + config_bdc.auteur +
            ` et bénéficie de l’offre exceptionnelle d'abonnement ` + this.startDuration() + (!this.isFreeMonth() ?
            ` à ` + this.starting_price + `&nbsp;€ par ` + this.printMoyenPaiement() + `.` : `.`) +`</p>

                    <p>Je comprends que cette offre spéciale me permet de bénéficier des analyses uniques de ` +
            config_bdc.auteur +
            `, des dossiers cadeaux ainsi que de ses alertes mensuelles.
                    </p>

                    <p>Le renouvellement est automatique, à la fin de ma période d'abonnement je serai donc débité de ` +
            this.default_price + `&nbsp;€ par ` + this.printMoyenPaiement() +
            ` par ` + convertToDurationBis(this.renewal_term_length) +
            ` et ainsi de suite jusqu'à ce que vous demandiez l'arrêt de l'abonnement.
                    </p>

                    <p>Je me réjouis de découvrir ` + config_bdc.publication +
            ` avec `+ config_bdc.auteur +` et comprends que cette offre spéciale n’est disponible que pour un temps limité. </p>`

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
            //affichage = this.starting_price_duration + " mois gratuit";
            affichage = "Gratuit";
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

function choix_en_Cours() {
    console.log("CHOIX EN COURS = " + parseInt($('input[type=radio][name=vanguard-choices]:checked').attr('id')
        .split('-').pop()))
    return parseInt($('input[type=radio][name=vanguard-choices]:checked').attr('id').split('-').pop());
}

function findChoiceById(choices, id) {
    return choices.find(choice => choice.id === id) || null;
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
            genre == 0 ? duration = '2 ans' : duration = '2 ans';
            break;
        case 36:
            genre == 0 ? duration = '3 ans' : duration = '3 ans';
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

function addEventOnChoice(choices) {
    $('.vanguard-choice-name').click(function () {

        var choiceSelected = null;
        var inputId = parseInt($(this).find('input[name="vanguard-choices"]').attr('id').replace(
            "vanguard-choice-", ""));
        $.each(choices, function (index, choice) {
            if (choice.id == inputId) {
                choiceSelected = choice;
            }
        });
        changeRecapitulatif(choiceSelected);
    });

}

function changeRecapitulatif(choice) {
    $('.module-block-recapitulative-v2').html(choice.printRecapitulatif());
}


function printNbDossiers(dossiers, val) {
    if (val) {
        return dossiers.length > 1 ? `Les ` + dossiers.length + `&nbsp;dossiers spéciaux` : `Le dossier spécial`;
    } else {
        return dossiers.length > 1 ? `Les ` + dossiers.length + `&nbsp;dossiers cadeaux` : `Le dossier cadeaux`;
    }
}

function printDossiers(dossiers, dossiers_speciaux) {
    if (dossiers.length > 0 || dossiers_speciaux.length > 0) {
        // Trouver l'élément avec l'ID "dossiers"
        const element = $('#dossiers');
        element.append(`
    <h3 class="text-center font-weight-bold">Voici tout ce que vous recevez
        <em><u>IMMÉDIATEMENT</u></em> en rejoignant <em>` + config_bdc.publication + `</em>&nbsp;:
    </h3>`);
        if (dossiers_speciaux.length > 0) {
            element.append(`<h4 class="primary mt-5 font-weight-bold text-uppercase">` +
                printNbDossiers(dossiers_speciaux, true) + `</h4>`);

            dossiers_speciaux.forEach((dossier, indice) => {

                element.append(
                    `<div class="row align-items-center my-2">
            <div class="col-md-6 col-12 "><img class="d-block mx-auto" style="max-width: 300px;width:100%;" src="` +
                    dossier.url_photo + `" alt="image d'Ipad">
            </div>
            <div class="col-md-6 col-12">

                <h4 class="mt-5"><strong>Dossier N°` + (indice + 1) +
                    `&nbsp;: <em><span style="text-transform: uppercase;">` + dossier.title + `</span></em></strong>
                </h4>
                ` + dossier.description + `
            </div>
        </div><hr>`);
            });
        }

        if (dossiers.length > 0) {
            //dossiers_speciaux.length > 0 ? element.append(`<hr>`) : "";
            if (dossiers.length > 0) {
                element.append(`<h4 class="primary mt-5 font-weight-bold text-uppercase">` +
                    printNbDossiers(dossiers, false) + `</h4>`);

                dossiers.forEach((dossier, indice) => {

                    element.append(
                        `<div class="row align-items-center my-2">
                    <div class="col-md-6 col-12"><img class="d-block mx-auto" style="max-width: 300px;width:100%;" src="` +
                        dossier.url_photo + `" alt="image d'Ipad">
                    </div>
                    <div class="col-md-6 col-12">

                        <h4 class="mt-5"><strong>Dossier N°` + (indice + 1) +
                        `&nbsp;: <em><span style="text-transform: uppercase;">` + dossier.title + `</span></em></strong>
                        </h4>
                        ` + dossier.description + `
                    </div>
                </div><hr>`);
                });

            }
        }
    }

}


function customizeChoices(choices) {
    // Récupérer tous les éléments qui ont au moins une des classes spécifiées
    const elementsToRemove = document.querySelectorAll(
        ".vanguard-choice-price, .vanguard-choice-description, .vanguard-choice-payment-method-image-container, label[for*='vanguard-choice-']"
    );

    // Supprimer tous les éléments récupérés
    elementsToRemove.forEach(function (element) {
        element.remove();
    });

    choices.forEach((choice, index) => {

        VANGUARD_LOCAL_CONFIG.choices[index].className = choices.length <= 4 ? "my-1 col-md-6 col-12 mb-6 mx-auto" :
                "my-1 col-md col-12 mb-6";
        // Trouver l'élément avec l'ID "vanguard-choice-[choice.id]"
        const element = $('#vanguard-choice-' + choice.id);

        //Remplissage du choice
        element.after(`<div class="generic_content">
          <div class="generic_head_price">
              <div class="generic_head_content">
                  <div class="head_bg">&nbsp;</div>
                  <div class="head">` + choice.printHeader() + `</div>
              </div>
              <div class="generic_price_tag">
                  ` + choice.printOffre() + `
                  </p>
                  ` + choice.printOldPrice() + choice.price() + `
                  <br><p style="font-size:12px" class="mt-4 mb-2"">` + choice
            .printRenouvellement() + `<br>Annulable sur simple demande</p>` + choice.printBandeau() + `

              </div>
          </div>
      </div>`);
    });


    $('.generic_content').each(function () {
        // Suppression de tous les éléments 'span' qui suivent l'élément courant
        $(this).nextAll('span').remove();
    });
}

document.addEventListener("vanguard-ready", function () {

    var choices = []; // Crée un tableau vide pour les choices
    window.VANGUARD_LOCAL_CONFIG.choices.forEach(function (choice, index) {
        choices.push(new Choice(choice.id, index + 1, choice.stackLetter, choice.paymentMethod,
            choice.startingPriceDuration,
            choice.renewalTermLength, choice.startingPrice, choice.defaultPrice, choice
            .isBcl, choice.customHtml))

    });

    //window.choices_window = choices;

    // Ajout d'un écouteur d'événement au changement
    $('input[name="vanguard-payment-method-radio"]').on('change', () => {
        // Code à exécuter lors du changement de l'input
        console.log('L\'input a été modifié !');

        customizeChoices(choices);

        addEventOnChoice(choices);
        var choiceSelected;
        var inputId = parseInt($('.vanguard-custom-choice.selected input').attr('id').replace(
            "vanguard-choice-", ""));
        $.each(choices, function (index, choice) {
            if (choice.id == inputId) {
                choiceSelected = choice;
            }
        });
        console.log(inputId);
        console.log(choiceSelected);
        changeRecapitulatif(choiceSelected);
    });

    $('#items-choices').removeClass('list-group');
    $('#items-choices').addClass('row');
    customizeChoices(choices);
    addEventOnChoice(choices);
    changeRecapitulatif(choices[0]);
    printDossiers(dossiers, dossiers_speciaux);
});
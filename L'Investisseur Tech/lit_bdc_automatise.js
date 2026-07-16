function Dossier(title, url_photo, description) {
  this.title = title;
  this.url_photo = url_photo;
  this.description = description;
}

function Choice(
  id,
  index,
  stackLetter,
  paymentMethod,
  starting_price_duration,
  renewal_term_length,
  starting_price,
  default_price,
  auto_renew,
  customHtml,
) {
  this.id = id;
  this.index = index;
  this.stackLetter = stackLetter;
  this.paymentMethod = paymentMethod;
  this.renewal_term_length = renewal_term_length;
  this.default_price = default_price;
  this.auto_renew = auto_renew;
  this.customHtml = customHtml;
  this.starting_price = starting_price;
  this.starting_price_duration = starting_price_duration;

  /**  if (starting_price_duration == 0) {
        this.starting_price = default_price;
        this.starting_price_duration = renewal_term_length;
    } else {
        this.starting_price = starting_price;
        this.starting_price_duration = starting_price_duration;
    }*/

  try {
    this.customHtml = JSON.parse(customHtml);
    this.old_price = this.customHtml.old_price;
    this.engagement = this.customHtml.engagement;
    this.sticker_satisfait_echange = this.customHtml.sticker_satisfait_echange;
    this.sticker_satisfait_rembourse =
      this.customHtml.sticker_satisfait_rembourse;
    this.features = this.customHtml.features;
    this.pill = this.customHtml.pill;
  } catch (error) {
    this.customHtml = "";
    this.old_price = null;
    this.engagement = 0;
    this.sticker_satisfait_echange = null;
    this.sticker_satisfait_rembourse = null;
    this.features = null;
    this.pill = null;
  }

  /**
   * Fonction qui permet de savoir si il y a une des mois offerts avant un renouvelllement payant
   **/
  Choice.prototype.isEngagement = function () {
    if (this.engagement > 0) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Fonction qui permet de savoir si il y a une des mois offerts avant un renouvelllement payant
   **/
  Choice.prototype.isFreeWithPaidRenewal = function () {
    if (
      this.starting_price == 0 &&
      this.starting_price_duration != 0 &&
      this.default_price != 0 &&
      this.auto_renew == 1
    ) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Fonction qui permet de savoir si c'est une offre life
   **/
  Choice.prototype.isLife = function () {
    if (
      ((this.starting_price > 500 && this.default_price == 99) ||
        (this.starting_price > 280 && this.default_price == 19)) &&
      this.starting_price_duration == 12 &&
      this.renewal_term_length == 12 &&
      this.auto_renew == 1
    ) {
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
  Choice.prototype.isAnnuelTriFreemonth = function () {
    if (this.starting_price_duration == 15 && this.renewal_term_length == 12) {
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
    var affichage = "";
    if (this.isLife()) {
      affichage = "à vie";
    } else if (this.isFreeMonth()) {
      if (this.starting_price_duration > 1) {
        affichage =
          convertToDuration(this.renewal_term_length, genre) +
          ` avec ` +
          this.starting_price_duration +
          ` mois gratuits`;
      } else {
        affichage =
          convertToDuration(this.renewal_term_length, genre) +
          ` avec ` +
          this.starting_price_duration +
          ` mois gratuit`;
      }
    } else {
      affichage = convertToDuration(this.starting_price_duration, genre);
    }
    if (this.isEngagement()) {
      affichage =
        affichage + " avec engagement sur " + this.engagement + " mois";
    }

    return affichage;
  };

  /**
   * Fonction qui retourne le header du choice
   **/
  Choice.prototype.printHeader = function () {
    var affichage = "";
    if (this.isLife()) {
      affichage = "à vie";
    } else if (this.isFreeMonth()) {
      affichage = "gratuit";
    } else if (this.isAnnuelTriFreemonth()) {
      affichage = "Annuel";
    } else {
      affichage = convertToDuration(this.starting_price_duration);
    }
    if (this.isEngagement()) {
      affichage =
        affichage +
        `<p style="font-size: 12px;margin-top:-5px;">Engagement 12 mois</p>`;
    }
    return affichage;
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
      url_logo = "https://vauban-cdn.pubfac.io/bdc/sepa-logo.png";
    } else {
      text = "Paiement par Carte de Crédit";
      url_logo = "https://vauban-cdn.pubfac.io/bdc/cc-logo.png";
    }

    if (this.isLife()) {
      affichage = "Offre à vie";
    } else if (this.isFreeMonth()) {
      if (this.starting_price_duration > 1) {
        affichage = this.starting_price_duration + " mois gratuits";
      } else {
        affichage = this.starting_price_duration + " mois gratuit";
      }
    } else {
      affichage = this.starting_price_duration + `&nbsp;mois d'abonnement`;
    }

    return (
      `<p><strong>` +
      text +
      `</strong><br><img
                          style="max-width: 200px; width:100%; display: block; margin-left: auto; margin-right: auto;"
                          src="` +
      url_logo +
      `"> <br> ` +
      affichage
    );
  };

  /**
   * Fonction qui retourne l'affichage de l'ancien prix (rien si pas d'info)
   **/
  Choice.prototype.printOldPrice = function () {
    return this.old_price
      ? `<p style="text-decoration: line-through; color: red; font-weight: 600; margin-bottom: 0px !important;">
                      ` +
          this.old_price +
          `&nbsp;€</p>`
      : `<p style="margin-bottom: 0px !important;">&nbsp;</p>`;
  };

  /**
   * Fonction qui retourne l'affichage du sticker "Satisfait ou échangé" / "Satisfait ou remboursé"
   * en haut à droite du cadre (rien si pas d'info). L'échangé est prioritaire si les deux sont renseignés.
   **/
  Choice.prototype.printSticker = function () {
    var type = null;
    var jours = null;
    var libelle = "";
    if (this.sticker_satisfait_echange) {
      type = "echange";
      jours = this.sticker_satisfait_echange;
      libelle = "échangé";
    } else if (this.sticker_satisfait_rembourse) {
      type = "rembourse";
      jours = this.sticker_satisfait_rembourse;
      libelle = "remboursé";
    }
    return type
      ? `<img class="sticker-satisfait-echange" style="position: absolute; top: 0; right: 0; transform: translate(35%, -35%) rotate(8deg); width: 30%; max-width: 90px; height: auto; z-index: 10;"
                      src="https://vauban-cdn.pubfac.io/uploads/sticker-satisfait-` +
          type +
          `-` +
          jours +
          `.png" alt="Satisfait ou ` +
          libelle +
          ` ` +
          jours +
          ` jours">`
      : ``;
  };

  /**
   * Fonction qui retourne l'affichage des conditions d'engagement. ("Annulable sur simple demande" si pas d'info)
   **/
  Choice.prototype.printEngagement = function () {
    if (this.engagement == 12) {
      return "Engagement sur 1 an<br>Puis annulable sur simple demande";
    } else {
      return "Annulable sur simple demande";
    }
  };

  /**
   * Fonction qui retourne l'affichage des conditions d'engagement. ("Annulable sur simple demande" si pas d'info)
   **/
  Choice.prototype.printEngagementRecap = function () {
    if (this.isEngagement()) {
      return (
        `avec un engagement de ` +
        this.engagement +
        ` mois à ` +
        this.default_price +
        `&nbsp;€ par ` +
        convertToDurationBis(this.renewal_term_length)
      );
    } else {
      return "";
    }
  };

  /**
   * Fonction qui retourne l'affichage du récapitulatif
   **/
  Choice.prototype.printRecapitulatif = function () {
    return (
      ` <h4 class="text-uppercase" >OFFRE ` +
      this.startDuration(1) +
      `</h4>
                    <p>OUI, je m’inscris à ` +
      config_bdc.publication +
      ` avec ` +
      config_bdc.auteur +
      ` et bénéficie de l’offre exceptionnelle d'abonnement ` +
      this.startDuration() +
      ` à ` +
      this.starting_price +
      `&nbsp;€ par ` +
      this.printMoyenPaiement() +
      this.retractationDelay() +
      `.</p>

                    <p>Je comprends que cette offre spéciale me permet de bénéficier des analyses uniques de ` +
      config_bdc.auteur +
      `, des dossiers cadeaux ainsi que des alertes mensuelles.
                    </p>

                    <p>Le renouvellement est automatique, à la fin de ma période d'abonnement ` +
      this.printEngagementRecap() +
      `, je serai donc débité de ` +
      this.default_price +
      `&nbsp;€ par ` +
      this.printMoyenPaiement() +
      ` par ` +
      convertToDurationBis(this.renewal_term_length) +
      ` jusqu'à ce que vous demandiez l'arrêt de l'abonnement.
                    </p>

                    <p>Je me réjouis de découvrir ` +
      config_bdc.publication +
      ` avec ` +
      config_bdc.auteur +
      ` et comprends que cette offre spéciale n’est disponible que pour un temps limité. </p>`
    );
  };

  /**
   * Fonction qui retourne l'affichage du moyen de renouvellement
   **/
  Choice.prototype.printRenouvellement = function () {
    var affichage = "";
    if (this.isLife()) {
      //Dans le cas d'une offre à vie
      return (
        "Frais de maintenance à " +
        this.default_price +
        "&nbsp;€ par " +
        convertToDurationBis(this.renewal_term_length)
      );
    } else {
      if (
        this.isFreeMonth() ||
        this.starting_price_duration != this.renewal_term_length
      ) {
        //Dans le cas où c'est un freemonth ou une durée de renouvellement différent de la durée initiale
        return (
          "Renouvellement " +
          convertToDuration(this.renewal_term_length) +
          " automatique à " +
          this.default_price +
          "&nbsp;€"
        );
      } else if (this.starting_price != this.default_price) {
        //Dans le cas où c'est un freemonth ou une durée de renouvellement différent de la durée initiale
        return "Renouvellement automatique à " + this.default_price + "&nbsp;€";
      }
      return "Renouvellement automatique";
    }
  };

  /**
   * Fonction qui retourne le texte du bandeau de promotion (sans habillage)
   **/
  Choice.prototype.bandeauText = function () {
    var affichage = "";
    if (this.isLife()) {
      //Dans le cas d'une offre à vie
      affichage = "Offre à vie";
    } else if (this.isFreeMonth()) {
      if (this.starting_price_duration > 1) {
        affichage = this.starting_price_duration + " mois gratuits";
      } else {
        affichage = this.starting_price_duration + " mois gratuit";
      }
    } else if (
      this.starting_price != this.default_price &&
      this.old_price &&
      this.starting_price_duration == this.renewal_term_length
    ) {
      affichage =
        this.starting_price_duration +
        " mois avec " +
        Math.round(100 - (this.starting_price * 100) / this.old_price) +
        `% de réduction`;
    } else {
      //Si il y a ancien prix -> Calcul la remise Sinon affiche "Offre spéciale"
      affichage = this.old_price
        ? Math.round(100 - (this.starting_price * 100) / this.old_price) +
          `% de réduction`
        : "Offre spéciale";
    }
    return affichage;
  };

  /**
   * Fonction qui retourne l'affichage du bandeau de promotion
   **/
  Choice.prototype.printBandeau = function () {
    return (
      `<p style="background-color:green; color:white; padding:5px;">` +
      this.bandeauText() +
      `</p>`
    );
  };

  /**
   * V2 — Libellé de l'offre en tête de card
   **/
  Choice.prototype.planLabelV2 = function () {
    var label;
    if (this.isLife()) {
      label = "à vie";
    } else if (this.isFreeMonth() || this.isAnnuelTriFreemonth()) {
      label = convertToDuration(this.renewal_term_length);
    } else {
      label = convertToDuration(this.starting_price_duration);
    }
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  /**
   * V2 — Texte de la pastille : clé "pill" du customHtml, sinon texte du bandeau
   **/
  Choice.prototype.pillTextV2 = function () {
    return this.pill ? this.pill : this.bandeauText();
  };

  /**
   * V2 — Bloc prix : "X mois offert(s)" pour un freemonth, sinon prix + ancien prix barré
   **/
  Choice.prototype.printPriceV2 = function () {
    if (this.isFreeMonth()) {
      var offert =
        this.starting_price_duration > 1
          ? this.starting_price_duration + " mois offerts"
          : "1<sup>er</sup> mois offert";
      return (
        `<div class="v2-price-line"><p class="v2-price v2-offert">` +
        offert +
        `</p></div>
        <p class="v2-after">puis ` +
        this.default_price +
        `&nbsp;€ / ` +
        convertToDurationBis(this.renewal_term_length) +
        (this.old_price
          ? ` <span class="v2-old">` + this.old_price + `&nbsp;€</span>`
          : ``) +
        `</p>
        <p class="v2-dur">Sans frais pour commencer</p>`
      );
    }
    return (
      `<div class="v2-price-line"><p class="v2-price">` +
      this.starting_price +
      `&nbsp;€</p>` +
      (this.old_price
        ? `<span class="v2-old">` + this.old_price + `&nbsp;€</span>`
        : ``) +
      `<span class="v2-ttc">TTC</span></div>
      <p class="v2-dur">` +
      (this.isLife()
        ? `Accès à vie`
        : this.starting_price_duration + `&nbsp;mois d'abonnement`) +
      `</p>`
    );
  };

  /**
   * V2 — Liste à coches. La mention de renouvellement est toujours générée en
   * première ligne (mention légale). Ensuite : les "features" du customHtml si
   * présentes (préfixe "-" pour une croix), sinon engagement + dossiers.
   * Plafond : 5 lignes affichées.
   **/
  Choice.prototype.printFeaturesV2 = function () {
    var lines = [{ ok: true, text: this.printRenouvellement() }];
    if (Array.isArray(this.features) && this.features.length > 0) {
      this.features.forEach(function (feature) {
        if (typeof feature === "string" && feature.trim() !== "") {
          var text = feature.trim();
          if (text.charAt(0) === "-") {
            lines.push({ ok: false, text: text.slice(1).trim() });
          } else {
            lines.push({ ok: true, text: text });
          }
        }
      });
    } else {
      lines.push({ ok: true, text: this.printEngagement() });
      var nbDossiers = 0;
      if (typeof dossiers !== "undefined" && Array.isArray(dossiers)) {
        nbDossiers += dossiers.length;
      }
      if (
        typeof dossiers_speciaux !== "undefined" &&
        Array.isArray(dossiers_speciaux)
      ) {
        nbDossiers += dossiers_speciaux.length;
      }
      if (nbDossiers > 0) {
        lines.push({
          ok: true,
          text:
            nbDossiers > 1
              ? nbDossiers + `&nbsp;dossiers cadeaux inclus`
              : `1&nbsp;dossier cadeau inclus`,
        });
      }
    }
    lines = lines.slice(0, 5);
    var affichage = `<ul class="v2-feat">`;
    lines.forEach(function (line) {
      affichage +=
        `<li class="` +
        (line.ok ? `v2-ok` : `v2-no`) +
        `">` +
        line.text +
        `</li>`;
    });
    return affichage + `</ul>`;
  };

  /**
   * V2 — Logo du moyen de paiement en pied de card
   **/
  Choice.prototype.printPaymentV2 = function () {
    var url_logo =
      this.paymentMethod == "sepa"
        ? "https://vauban-cdn.pubfac.io/bdc/sepa-logo.png"
        : "https://vauban-cdn.pubfac.io/bdc/cc-logo.png";
    var alt =
      this.paymentMethod == "sepa" ? "Prélèvement SEPA" : "Carte de crédit";
    return (
      `<div class="v2-pay"><img src="` + url_logo + `" alt="` + alt + `"></div>`
    );
  };

  /**
   * V2 — Card complète (design "Fintech clair", déclinaison A)
   **/
  Choice.prototype.printCardV2 = function () {
    return (
      `<div class="v2-card">
        <div class="v2-in">
          <p class="v2-plan">` +
      this.planLabelV2() +
      `</p>
          <p class="v2-pill">` +
      this.pillTextV2() +
      `</p>` +
      this.printPriceV2() +
      `<hr class="v2-sep">` +
      this.printFeaturesV2() +
      this.printPaymentV2() +
      `</div>
        <div class="v2-foot"><span class="v2-choose">Choisir cette offre</span><span class="v2-chosen">&#10003; Offre sélectionnée</span></div>
      </div>`
    );
  };

  Choice.prototype.printMoyenPaiement = function () {
    if (this.paymentMethod == "sepa") {
      return "mandat SEPA";
    } else {
      return "carte de crédit";
    }
  };

  Choice.prototype.retractationDelay = function () {
    if (this.isFreeMonth == false) {
      return " et je bénéficie de mon droit de rétractation de 14 jours";
    } else {
      return "";
    }
  };
}

function choix_en_Cours() {
  console.log(
    "CHOIX EN COURS = " +
      parseInt(
        $("input[type=radio][name=vanguard-choices]:checked")
          .attr("id")
          .split("-")
          .pop(),
      ),
  );
  return parseInt(
    $("input[type=radio][name=vanguard-choices]:checked")
      .attr("id")
      .split("-")
      .pop(),
  );
}

function findChoiceById(choices, id) {
  return choices.find((choice) => choice.id === id) || null;
}

function convertToDuration(number, genre = 0) {
  let duration;

  switch (number) {
    case 1:
      genre == 0 ? (duration = "mensuel") : (duration = "mensuelle");
      break;
    case 2:
      genre == 0 ? (duration = "bimensuel") : (duration = "bimensuele");
      duration = "bimensuel";
      break;
    case 3:
      genre == 0 ? (duration = "trimestriel") : (duration = "trimestrielle");
      break;
    case 6:
      genre == 0 ? (duration = "semestriel") : (duration = "semestrielle");
      break;
    case 12:
      genre == 0 ? (duration = "annuel") : (duration = "annuelle");
      break;
    case 24:
      genre == 0 ? (duration = "2 ans") : (duration = "2 ans");
      break;
    case 36:
      genre == 0 ? (duration = "3 ans") : (duration = "3 ans");
      break;
    default:
      duration = "durée inconnue";
      break;
  }

  return duration;
}

function convertToDurationBis(number) {
  let duration;

  switch (number) {
    case 1:
      duration = "mois";
      break;
    case 2:
      duration = "";
      break;
    case 3:
      duration = "trimestre";
      break;
    case 6:
      duration = "semestre";
      break;
    case 12:
      duration = "an";
      break;
    case 24:
      duration = "2 ans";
      break;
    case 36:
      duration = "3 ans";
      break;
    default:
      duration = "durée inconnue";
      break;
  }

  return duration;
}

function addEventOnChoice(choices) {
  $(".vanguard-choice-name")
    .off("click.vanguard-choice")
    .on("click.vanguard-choice", function () {
      var choiceSelected = null;
      var inputId = parseInt(
        $(this)
          .find('input[name="vanguard-choices"]')
          .attr("id")
          .replace("vanguard-choice-", ""),
      );
      $.each(choices, function (index, choice) {
        if (choice.id == inputId) {
          choiceSelected = choice;
        }
      });
      changeRecapitulatif(choiceSelected);
    });
}

function changeRecapitulatif(choice) {
  $(".module-block-recapitulative-v2").html(choice.printRecapitulatif());
}

function printNbDossiers(dossiers, val) {
  if (val) {
    return dossiers.length > 1
      ? `Les ` + dossiers.length + `&nbsp;dossiers spéciaux`
      : `Le dossier spécial`;
  } else {
    return dossiers.length > 1
      ? `Les ` + dossiers.length + `&nbsp;dossiers cadeaux`
      : `Le dossier cadeau`;
  }
}

function printDossiers(dossiers, dossiers_speciaux) {
  if (dossiers.length > 0 || dossiers_speciaux.length > 0) {
    // Trouver l'élément avec l'ID "dossiers"
    const element = $("#dossiers");
    element.append(
      `
    <h3 class="text-center font-weight-bold text-uppercase">Voici tout ce que vous recevez en rejoignant <em>` +
        config_bdc.publication +
        `</em>&nbsp;:
    </h3>`,
    );
    if (dossiers_speciaux.length > 0) {
      element.append(
        `<h4 class="primary mt-5 font-weight-bold text-uppercase">` +
          printNbDossiers(dossiers_speciaux, true) +
          `</h4>`,
      );

      dossiers_speciaux.forEach((dossier, indice) => {
        element.append(
          `<div class="row align-items-center my-2">
            <div class="col-md-6 col-12 "><img class="d-block mx-auto" style="max-width: 300px;width:100%;" src="` +
            dossier.url_photo +
            `" alt="image d'Ipad">
            </div>
            <div class="col-md-6 col-12">

                <h4 class="mt-5"><strong>Dossier N°` +
            (indice + 1) +
            `&nbsp;: <em>` +
            dossier.title +
            `</em></strong>
                </h4>
                ` +
            dossier.description +
            `
            </div>
        </div><hr>`,
        );
      });
    }

    if (dossiers.length > 0) {
      //dossiers_speciaux.length > 0 ? element.append(`<hr>`) : "";
      if (dossiers.length > 0) {
        element.append(
          `<h4 class="primary mt-5 font-weight-bold text-uppercase">` +
            printNbDossiers(dossiers, false) +
            `</h4>`,
        );

        dossiers.forEach((dossier, indice) => {
          element.append(
            `<div class="row align-items-center my-2">
                    <div class="col-md-6 col-12"><img class="d-block mx-auto" style="max-width: 300px;width:100%;" src="` +
              dossier.url_photo +
              `" alt="image d'Ipad">
                    </div>
                    <div class="col-md-6 col-12">

                        <h4 class="mt-5"><strong>Dossier N°` +
              (indice + 1) +
              `&nbsp;: <em>` +
              dossier.title +
              `</em></strong>
                        </h4>
                        ` +
              dossier.description +
              `
                    </div>
                </div><hr>`,
          );
        });
      }
    }
  }
}

/**
 * Le nouveau design de cards (v2) ne s'active que si la page le demande via
 * config_bdc.card_design = "v2" — les autres pages gardent le rendu historique.
 **/
function isCardDesignV2() {
  return (
    typeof config_bdc !== "undefined" &&
    config_bdc &&
    config_bdc.card_design == "v2"
  );
}

function injectV2Styles() {
  if ($("#v2-cards-style").length > 0) {
    return;
  }
  $("head").append(
    `<style id="v2-cards-style">
      #items-choices .vanguard-choice-name { height: 100%; display: block; }
      .v2-card {
        background: #FFFFFF; color: #1E2530; border: 1px solid #E3E7EC;
        border-radius: 14px; text-align: left; height: 100%;
        display: flex; flex-direction: column;
        box-shadow: 0 2px 6px rgba(30, 37, 48, 0.06);
        font-size: 14px; line-height: 1.5;
      }
      .v2-in { padding: 24px 22px 0; display: flex; flex-direction: column; flex: 1; }
      .v2-plan {
        font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em;
        color: #5A6472; font-weight: 600; margin: 0 0 6px;
      }
      .v2-pill {
        display: inline-block; align-self: flex-start; font-size: 13px; font-weight: 600;
        background: #E7F5EC; color: #0B6B33; border-radius: 999px;
        padding: 3px 12px; margin: 0 0 16px;
      }
      .v2-price-line {
        display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
        margin: 0 0 2px; font-variant-numeric: tabular-nums;
      }
      .v2-price { font-size: 42px; font-weight: 700; letter-spacing: -0.03em; margin: 0; line-height: 1.05; color: #1E2530; }
      .v2-price.v2-offert { font-size: 30px; letter-spacing: -0.01em; }
      .v2-price sup { font-size: 55%; }
      .v2-old { color: #98A1AC; font-size: 16px; font-weight: 500; text-decoration: line-through; }
      .v2-ttc { font-size: 14px; color: #5A6472; font-weight: 500; }
      .v2-after { font-size: 14px; color: #3A4350; margin: 2px 0 0; font-weight: 500; }
      .v2-dur { font-size: 14px; color: #5A6472; margin: 4px 0 18px; }
      .v2-sep { border: none; border-top: 1px solid #ECEFF3; margin: 0 0 14px; width: 100%; }
      .v2-feat { list-style: none; margin: 0 0 auto; padding: 0 0 14px; font-size: 14px; color: #3A4350; }
      .v2-feat li { padding: 4px 0 4px 26px; position: relative; text-align: left; }
      .v2-feat li.v2-ok::before {
        content: "\\2713"; position: absolute; left: 3px; top: 4px;
        color: #0E8A3E; font-weight: 700;
      }
      .v2-feat li.v2-no { color: #8A929C; }
      .v2-feat li.v2-no::before {
        content: "\\2715"; position: absolute; left: 3px; top: 4px;
        color: #B7BEC7; font-weight: 700;
      }
      .v2-pay { padding: 0 0 16px; }
      .v2-pay img { height: 26px; width: auto; display: block; }
      .v2-foot {
        text-align: center; font-size: 14px; font-weight: 600; padding: 13px 12px;
        border-top: 1px solid #ECEFF3; color: #5A6472;
        border-radius: 0 0 13px 13px;
      }
      .v2-chosen { display: none; }
      .vanguard-custom-choice.selected .v2-card {
        border-color: #0E8A3E;
        box-shadow: 0 0 0 2px #0E8A3E, 0 4px 18px rgba(14, 138, 62, 0.16);
      }
      .vanguard-custom-choice.selected .v2-foot {
        background: #0E8A3E; color: #FFFFFF; border-top-color: #0E8A3E;
      }
      .vanguard-custom-choice.selected .v2-choose { display: none; }
      .vanguard-custom-choice.selected .v2-chosen { display: inline; }
    </style>`,
  );
}

function customizeChoices(choices) {
  // Récupérer tous les éléments qui ont au moins une des classes spécifiées
  const elementsToRemove = document.querySelectorAll(
    ".vanguard-choice-price, .vanguard-choice-description, .vanguard-choice-payment-method-image-container, label[for*='vanguard-choice-']",
  );

  // Supprimer tous les éléments récupérés
  elementsToRemove.forEach(function (element) {
    element.remove();
  });

  choices.forEach((choice, index) => {
    VANGUARD_LOCAL_CONFIG.choices[index].className =
      choices.length <= 4
        ? "my-1 col-md-6 col-12 mb-6"
        : "my-1 col-md col-12 mb-6";
    const element = $("#vanguard-choice-" + choice.id);
    element
      .nextAll(".generic_content, .sticker-satisfait-echange, .v2-card")
      .remove();

    if (isCardDesignV2()) {
      element.after(choice.printSticker() + choice.printCardV2());
      return;
    }

    element.after(
      choice.printSticker() +
        `<div class="generic_content">
          <div class="generic_head_price">
              <div class="generic_head_content">
                  <div class="head_bg">&nbsp;</div>
                  <div class="head">` +
        choice.printHeader() +
        `</div>
              </div>
              <div class="generic_price_tag">
                  ` +
        choice.printOffre() +
        `
                  </p>
                  ` +
        choice.printOldPrice() +
        `
                  <span class="price mb-4"><span class="currency">` +
        choice.starting_price +
        `&nbsp;€ </span>TTC</span>

                  <br><p style="font-size:12px" class="mt-4 mb-2">` +
        choice.printRenouvellement() +
        `<br>` +
        choice.printEngagement() +
        `</p>` +
        choice.printBandeau() +
        `

              </div>
          </div>
      </div>`,
    );

  });

  if (isCardDesignV2()) {
    injectV2Styles();
  }

  // Le sticker déborde du cadre : neutralise les overflow:hidden des
  // conteneurs parents (li, .vanguard-choice-name, #items-choices) qui le rogneraient
  if (
    choices.some(
      (choice) =>
        choice.sticker_satisfait_echange || choice.sticker_satisfait_rembourse,
    ) &&
    $("#sticker-overflow-fix").length === 0
  ) {
    $("head").append(
      `<style id="sticker-overflow-fix">
        #items-choices,
        #items-choices .vanguard-custom-choice,
        #items-choices .vanguard-choice-name {
          overflow: visible !important;
        }
        #items-choices .vanguard-choice-name {
          position: relative;
        }
      </style>`,
    );
  }

  $(".generic_content, .v2-card").each(function () {
    // Suppression de tous les éléments 'span' qui suivent l'élément courant
    $(this).nextAll("span").remove();
  });
}

function customSticky(choices) {
  if ($(".sticky").length > 0) {
    // L'élément avec la classe "sticky" existe dans le DOM
    if (choices.some((choice) => choice.isFreeMonth())) {
      $(".sticky").html(
        `<img style="max-width: 200px;width:100%;" src="https://vauban-cdn.pubfac.io/uploads/offre decouverte.png" height="auto">`,
      );
    }
  }
}

document.addEventListener("vanguard-ready", function () {
  var choices = []; // Crée un tableau vide pour les choices
  window.VANGUARD_LOCAL_CONFIG.choices.forEach(function (choice, index) {
    choices.push(
      new Choice(
        choice.id,
        index + 1,
        choice.stackLetter,
        choice.paymentMethod,
        choice.initialTermLength,
        choice.renewalTermLength,
        choice.price,
        choice.defaultPrice,
        choice.isBcl,
        choice.customHtml,
      ),
    );
  });

  //window.choices_window = choices;
  // Écouteur sur le switch de méthode de paiement (SEPA / carte bancaire)
  $('input[name="payment"]').on("click", function () {
    var selectedPaymentMethod = $(this).val();

    choices.forEach(function (choice) {
      choice.paymentMethod = selectedPaymentMethod;
    });

    $("#items-choices").css("visibility", "hidden");

    // setTimeout(0) ensures customizeChoices runs after Vanguard's own re-render handler
    setTimeout(function () {
      customizeChoices(choices);
      addEventOnChoice(choices);
      $("#items-choices").css("visibility", "visible");

      var choiceSelected;
      var selectedInput = $(".vanguard-custom-choice.selected input");
      if (selectedInput.length > 0) {
        var inputId = parseInt(
          selectedInput.attr("id").replace("vanguard-choice-", ""),
        );
        $.each(choices, function (index, choice) {
          if (choice.id == inputId) {
            choiceSelected = choice;
          }
        });
        changeRecapitulatif(choiceSelected);
      }
    }, 0);
  });
  $("#items-choices").removeClass("list-group");
  $("#items-choices").addClass("row");
  customizeChoices(choices);
  addEventOnChoice(choices);
  customSticky(choices);
  changeRecapitulatif(choices[0]);
  printDossiers(dossiers, dossiers_speciaux);
});

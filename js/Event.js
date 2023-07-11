class Event {
    eventName;
    eventLink;
    eventImage;
    eventGenre;
    eventCity;
    eventTimezone;
    eventPrice;
    eventDate;
    eventTime;
    eventPromoter;
    flag;
    eventAge = false;
    eventSale = false;
    uniqueId = Math.random().toString(36).substring(5) + Date.now().toString(36);

    constructor () {

    }

    parse(item) {
        this.eventName = item.name.substring(0, 18)+"..."
        this.eventLink = item.url;

        let imagesSize = item.images;
        let maxObj = imagesSize[0]
        for (let i = 1; i < imagesSize.length; i++) {
            const currentObj = imagesSize[i];
            if (currentObj.width > maxObj.width) {
                maxObj = currentObj;
            }
        }
        this.eventImage = maxObj.url;

        if (item.classifications) {
            this.eventGenre = item.classifications[0].genre.name;
        } else {
            this.eventGenre = ""
        }

        if (item.locale) {
            const countryCode = item.locale.split('-')[1];
            this.flag = countryCode.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
        }

        if (item._embedded) {
            this.eventCity = item._embedded.venues[0].city.name;
            this.eventTimezone = item._embedded.venues[0].name
        }

        if (item.priceRanges) {
            this.eventPrice = item.priceRanges[0].max.toFixed(0) + "€";
        } else {
            this.eventPrice = "";
        }

        if (item.dates.start.localDate) {
            let eventDateFirst = item.dates.start.localDate;
            let dataArray = eventDateFirst.split('-');
            let anno = +dataArray[0]; 
            let mese = +dataArray[1] - 1; 
            let giorno = +dataArray[2];
            this.eventDate = new Date(anno, mese, giorno).toLocaleDateString('it-IT');
            
            let nativeTime = ""
            if (item.dates.start.localTime) {
                nativeTime = item.dates.start.localTime;
                this.eventTime = nativeTime.split(':').slice(0, 2).join(':').substring(0, 5);
            }
        }

        if (item.promoters) {
            this.proeventPromoter = item.promoters[0].name
        }

        if (item.ageRestrictions) {
            this.eventAge = false
            if (item.ageRestrictions.legalAgeEnforced == true) {
                this.eventAge = true
            }
        }

        if (item.dates.status.code) {
            if (item.dates.status.code == "onsale") {
                this.eventSale = true
            }
            else {
                this.eventSale = false
            }
        } else {
            this.eventSale = false
        }
    }

    getTimeDateEmbedded() {
        if (this.eventDate && this.eventTime) {
            return '<div class="cardEventGenre d-flex align-items-center mb-2"><img class="me-2" src="/asset/images/icons/clock-hour-1.svg"><b>' + `${this.eventTime}` + " - " + `${this.eventDate}` + '</b></div>'
        }
        return ''
    }

    getAgeEmbedded() {
        if (this.ageRestrictions) {
            return '<div class="cardCategoriesCircle d-flex align-items-center justify-content-center mb-2 mb-md-0"><img class="cardIconCategories me-1" src="/asset/images/icons/alert-circle.svg" id="ageAlert"></div>'
        }
        return '<div class="cardCategoriesCircle d-flex align-items-center justify-content-center mb-2 mb-md-0"><img class="cardIconCategories me-1" src="/asset/images/icons/rating-12-plus.svg" id="ageAlert"></div>'
    }

    getSaleEmbedded() {
        if (this.eventSale) {
            return '<div class="cardCategories d-flex align-items-center mb-2 mb-md-0 mt-2 mt-md-0"><img class="cardIconCategories me-1" src="/asset/images/icons/ticket.svg" id="evSale">On Sale</div>'
        } 
        return '<div class="cardCategories d-flex align-items-center mb-2 mb-md-0 mt-2 mt-md-0"><img class="cardIconCategories me-1" src="/asset/images/icons/ticket-off.svg" id="evSale">Off Sale</div>'
    }

    getGenreEmbedded() {
        if (this.eventGenre) {
            return '<div class="cardCategories d-flex align-items-center mb-2 mb-md-0">' + `${this.eventGenre}`+ '</div>'
        } 
        return ''
    }

    getWhereEmbedded() {
        if (this.eventCity && this.eventTime) {
            return '<div class="cardEventGenre d-flex align-items-center mb-2"><img class="me-2" src="/asset/images/icons/location_2.svg"><b>' + `${this.eventTimezone} - ${this.eventCity} ${this.flag}`  + '</b></div>'
        } 
        return ''
    }

    getPromoterEmbedded() {
        if (this.eventPromoter) {
            return '<div class="cardEventGenre d-flex align-items-center mb-2"><img class="me-2" src="/asset/images/icons/speakerphone.svg"><b>' + `${this.eventPromoter}` + '</b></div>'
        } 
        return ''
    }

    renderCard () {
        return `<div class="cardEvent p-3 d-block d-md-flex" id="${this.uniqueId}">
            <div class="col-md-5 position-relative">
                <img src="${this.eventImage}" id="cardImg" class="cardEventImg mb-3 mb-md-0">
                <div class="shareButton d-none d-md-block">
                    <img src="/asset/images/icons/bookmark.svg" class="iconOnImgBook" id="bookmarkEventDesk">
                    <!-- <img src="/asset/images/icons/share-2.svg" class="iconOnImgShare" id="shareEventDesk"> -->
                </div>
            </div>
            <div class="col-md-7 ms-3 d-flex align-items-start flex-column bd-highlight">
                <div class="mb-auto bd-highlight">
                    <div class="cardEventName mb-2" id="eventName">${this.eventName}</div>
                    ${this.getWhereEmbedded()}
                    ${this.getTimeDateEmbedded()}
                    ${this.getPromoterEmbedded()}
                </div>
                <div class="bd-highlight w-100">
                    <div class="d-block d-md-flex justify-content-between">
                        <div class="d-md-flex d-block align-items-center">
                            ${this.getSaleEmbedded()}
                            ${this.getGenreEmbedded()}
                            ${this.getAgeEmbedded()}
                        </div>
                        <div class="me-3 d-block align-items-baseline">
                            <div class="cardPriceButton mb-1 text-end d-block d-md-none float-end" id="eventPrice">${this.eventPrice}</div>
                            <div class="cardPriceButton mb-1 text-end d-none d-md-block" id="eventPrice">${this.eventPrice}</div>
                            <div class="cardBuyButton text-start d-block d-md-none float-start"><a target="_blank" href="${this.eventLink}" id="hrefLink">See more</a></div>
                            <div class="cardBuyButton text-start d-none d-md-block"><a target="_blank" href="${this.eventLink}" id="hrefLink">See more</a></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        
    }

    // getAlertSideCard() {
    //     if (this.ageRestrictions) {
    //         return '<div class="cardCategoriesCircleSide d-flex align-items-center justify-content-center mb-1"><img class="cardIconSide" src="/asset/images/icons/alert-circle.svg"></div>'
    //     }
    //     return '<div class="cardCategoriesCircleSide d-flex align-items-center justify-content-center mb-1"><img class="cardIconSide" src="/asset/images/icons/rating-12-plus.svg"></div>'
    // }

    // getSaleSideCard() {
    //     if (this.eventSale) {
    //         return '<div class="cardCategoriesCircleSide d-flex align-items-center justify-content-center mb-1"><img class="cardIconSide" src="/asset/images/icons/ticket.svg"></div>'
    //     } 
    //         return '<div class="cardCategoriesCircleSide d-flex align-items-center justify-content-center mb-1"><img class="cardIconSide" src="/asset/images/icons/ticket-off.svg"></div>'
    // }

    renderCardSide (id = "", name = "", img = "", sale = "", alert = "", price = "", href = "") {
        return `<div class="cardEventSide p-2" id="${id}">
                    <img src="${img}" class="cardEventImgSide">
                    <img src="/asset/images/icons/x.svg" class="removeEventSide">
                    <div class="cardEventTitleSide mt-2">
                        ${name}
                    </div>
                    <div class="d-flex gap-2 mt-1">
                        <div class="cardCategoriesCircleSide d-flex align-items-center justify-content-center mb-1"><img class="cardIconSide" src="${sale}"></div>
                        <div class="cardCategoriesCircleSide d-flex align-items-center justify-content-center mb-1"><img class="cardIconSide" src="${alert}"></div>
                    </div>
                    <div class="cardFooterSide d-flex mt-1 justify-content-between align-items-center">
                        <div class="cardPriceSideBar">${price}</div>
                        <div class="cardSeeMoreBar"><a target="_blank" href="${href}">See more...</a></div>
                    </div>
                </div>`
    }
}

export default Event;
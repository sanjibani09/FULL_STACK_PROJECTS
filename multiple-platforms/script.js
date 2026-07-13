function loadPage(page){

    switch(page){

        case "home":
            homePage();
            break;

        case "about":
            aboutPage();
            break;

        case "contact":
            contactPage();
            break;

        case "login":
            loginPage();
            break;
    }

}

window.onload = function(){
    loadPage("home");
}
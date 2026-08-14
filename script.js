```javascript
// ==================================================
// PORTFOLIO MOBILE MENU
// ==================================================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("active");
    });
}

document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function () {
        if (navLinks) {
            navLinks.classList.remove("active");
        }
    });
});


// ==================================================
// DARK / LIGHT MODE
// ==================================================

const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {

    themeToggle.addEventListener("click", function () {

        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {
            themeToggle.textContent = "🌙";
            localStorage.setItem("theme", "dark");
        } else {
            themeToggle.textContent = "☀️";
            localStorage.setItem("theme", "light");
        }

    });

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        themeToggle.textContent = "🌙";
    }
}


// ==================================================
// CURRENT YEAR
// ==================================================

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// ==================================================
// SCROLL ANIMATION
// ==================================================

const animatedElements = document.querySelectorAll(
    ".skill-card, .highlight, .timeline-content, .contact-card"
);

if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(
        function (entries) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {

                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";

                    observer.unobserve(entry.target);
                }

            });

        },
        {
            threshold: 0.15
        }
    );

    animatedElements.forEach(function (element) {

        element.style.opacity = "0";
        element.style.transform = "translateY(25px)";
        element.style.transition =
            "opacity 0.6s ease, transform 0.6s ease";

        observer.observe(element);

    });
}


// ==================================================
// SUPABASE
// ==================================================

const SUPABASE_URL =
    "https://wfwxidbdyqwkqsbaxtlj.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_3OKrT7wF_P5P6vitgWpFJw_Opq-NvTr";


// ==================================================
// SESSION
// ==================================================

const accessToken =
    sessionStorage.getItem("parent_access_token");


// ==================================================
// DASHBOARD ELEMENTS
// ==================================================

const notificationList =
    document.getElementById("notificationList");

const notificationStatus =
    document.getElementById("notificationStatus");

const locationList =
    document.getElementById("locationList");

const locationStatus =
    document.getElementById("locationStatus");

const logoutButton =
    document.getElementById("logoutButton");


// ==================================================
// LOGIN CHECK
// ==================================================

if (
    (notificationList || locationList) &&
    !accessToken
) {
    window.location.replace("login.html");
}


// ==================================================
// LOGOUT
// ==================================================

if (logoutButton) {

    logoutButton.addEventListener("click", function () {

        sessionStorage.removeItem("parent_access_token");
        sessionStorage.removeItem("parent_refresh_token");
        sessionStorage.removeItem("parent_user");

        window.location.replace("login.html");

    });

}


// ==================================================
// HTML SECURITY
// ==================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==================================================
// SUPABASE HEADERS
// ==================================================

function getSupabaseHeaders() {

    return {
        "apikey": SUPABASE_KEY,
        "Authorization":
            "Bearer " + (accessToken || SUPABASE_KEY),
        "Content-Type": "application/json"
    };

}


// ==================================================
// LOAD NOTIFICATIONS
// ==================================================

async function loadNotifications() {

    if (!notificationList) {
        return;
    }

    if (notificationStatus) {
        notificationStatus.textContent =
            "● Updating...";
    }

    try {

        const url =
            SUPABASE_URL +
            "/rest/v1/notifications" +
            "?select=id,device_id,app_name,title,message,received_at" +
            "&order=received_at.desc" +
            "&limit=100";


        const response =
            await fetch(url, {
                method: "GET",
                headers: getSupabaseHeaders()
            });


        const responseText =
            await response.text();


        console.log(
            "Notifications Status:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "Supabase returned " +
                response.status +
                ": " +
                responseText
            );

        }


        let notifications;

        try {

            notifications =
                JSON.parse(responseText);

        } catch (error) {

            throw new Error(
                "Supabase returned invalid JSON"
            );

        }


        displayNotifications(notifications);


        if (notificationStatus) {

            notificationStatus.textContent =
                "● Connected • " +
                notifications.length +
                " notifications";

        }

    } catch (error) {

        console.error(
            "Notification loading error:",
            error
        );


        notificationList.innerHTML =
            '<div class="notification-empty">' +

                '<span>⚠️</span>' +

                '<p class="error-message">' +
                    'Unable to load notifications' +
                '</p>' +

                '<small>' +
                    escapeHTML(error.message) +
                '</small>' +

            '</div>';


        if (notificationStatus) {

            notificationStatus.textContent =
                "● Connection Error";

        }

    }

}


// ==================================================
// DISPLAY NOTIFICATIONS
// ==================================================

function displayNotifications(notifications) {

    if (!notificationList) {
        return;
    }


    if (
        !Array.isArray(notifications) ||
        notifications.length === 0
    ) {

        notificationList.innerHTML =
            '<div class="notification-empty">' +

                '<span>🔔</span>' +

                '<p>No notifications yet</p>' +

                '<small>' +
                    'Notifications from the Android app ' +
                    'will appear here.' +
                '</small>' +

            '</div>';

        return;
    }


    notificationList.innerHTML = "";


    notifications.forEach(function (notification) {

        const card =
            document.createElement("div");


        card.className =
            "notification-card";


        const appName =
            notification.app_name ||
            notification.app ||
            notification.package_name ||
            "Unknown App";


        const title =
            notification.title ||
            notification.notification_title ||
            "Notification";


        const message =
            notification.message ||
            notification.text ||
            notification.notification_text ||
            "";


        const deviceId =
            notification.device_id ||
            notification.device ||
            "Unknown Device";


        const receivedAt =
            notification.received_at ||
            notification.created_at ||
            notification.timestamp;


        let formattedTime =
            "Unknown time";


        if (receivedAt) {

            const date =
                new Date(receivedAt);


            if (!isNaN(date.getTime())) {

                formattedTime =
                    date.toLocaleString();

            }

        }


        card.innerHTML =

            '<div class="notification-card-top">' +

                '<div class="notification-app">' +
                    '📱 ' +
                    escapeHTML(appName) +
                '</div>' +

                '<div class="notification-time">' +
                    escapeHTML(formattedTime) +
                '</div>' +

            '</div>' +


            '<div class="notification-title">' +
                escapeHTML(title) +
            '</div>' +


            '<div class="notification-message">' +
                escapeHTML(message) +
            '</div>' +


            '<div class="notification-device">' +
                'Device: ' +
                escapeHTML(deviceId) +
            '</div>';


        notificationList.appendChild(card);

    });

}


// ==================================================
// LOAD LOCATIONS
// ==================================================

async function loadLocations() {

    if (!locationList) {
        return;
    }


    if (locationStatus) {

        locationStatus.textContent =
            "● Updating...";

    }


    try {

        const url =
            SUPABASE_URL +
            "/rest/v1/locations" +
            "?select=id,created_at,device_id,latitude,longitude" +
            "&order=created_at.desc" +
            "&limit=100";


        const response =
            await fetch(url, {
                method: "GET",
                headers: getSupabaseHeaders()
            });


        const responseText =
            await response.text();


        console.log(
            "Locations Status:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "Supabase returned " +
                response.status +
                ": " +
                responseText
            );

        }


        let locations;

        try {

            locations =
                JSON.parse(responseText);

        } catch (error) {

            throw new Error(
                "Supabase returned invalid JSON"
            );

        }


        displayLocations(locations);


        if (locationStatus) {

            locationStatus.textContent =
                "● Connected • " +
                locations.length +
                " locations";

        }

    } catch (error) {

        console.error(
            "Location loading error:",
            error
        );


        locationList.innerHTML =
            '<div class="location-empty">' +

                '<span>⚠️</span>' +

                '<p class="error-message">' +
                    'Unable to load locations' +
                '</p>' +

                '<small>' +
                    escapeHTML(error.message) +
                '</small>' +

            '</div>';


        if (locationStatus) {

            locationStatus.textContent =
                "● Connection Error";

        }

    }

}


// ==================================================
// DISPLAY LOCATIONS
// ==================================================

function displayLocations(locations) {

    if (!locationList) {
        return;
    }


    if (
        !Array.isArray(locations) ||
        locations.length === 0
    ) {

        locationList.innerHTML =
            '<div class="location-empty">' +

                '<span>📍</span>' +

                '<p>No locations yet</p>' +

                '<small>' +
                    'Location data from the Android app ' +
                    'will appear here.' +
                '</small>' +

            '</div>';

        return;
    }


    locationList.innerHTML = "";


    locations.forEach(function (location) {

        const card =
            document.createElement("div");


        card.className =
            "location-card";


        const deviceId =
            location.device_id ||
            "Unknown Device";


        const latitude =
            location.latitude !== null &&
            location.latitude !== undefined
                ? location.latitude
                : "N/A";


        const longitude =
            location.longitude !== null &&
            location.longitude !== undefined
                ? location.longitude
                : "N/A";


        let formattedTime =
            "Unknown time";


        if (location.created_at) {

            const date =
                new Date(location.created_at);


            if (!isNaN(date.getTime())) {

                formattedTime =
                    date.toLocaleString();

            }

        }


        let mapLink = "#";


        if (
            location.latitude !== null &&
            location.latitude !== undefined &&
            location.longitude !== null &&
            location.longitude !== undefined
        ) {

            mapLink =
                "https://www.google.com/maps?q=" +
                encodeURIComponent(
                    location.latitude +
                    "," +
                    location.longitude
                );

        }


        card.innerHTML =

            '<div class="location-card-top">' +

                '<div class="notification-app">' +
                    '📍 Location' +
                '</div>' +

                '<div class="location-time">' +
                    escapeHTML(formattedTime) +
                '</div>' +

            '</div>' +


            '<div class="location-coordinates">' +

                '<div class="coordinate-box">' +

                    '<span class="coordinate-label">' +
                        'Latitude' +
                    '</span>' +

                    '<span class="coordinate-value">' +
                        escapeHTML(latitude) +
                    '</span>' +

                '</div>' +


                '<div class="coordinate-box">' +

                    '<span class="coordinate-label">' +
                        'Longitude' +
                    '</span>' +

                    '<span class="coordinate-value">' +
                        escapeHTML(longitude) +
                    '</span>' +

                '</div>' +

            '</div>' +


            '<div class="location-device">' +

                'ID: ' +
                escapeHTML(location.id) +

                '<br>' +

                'Device: ' +
                escapeHTML(deviceId) +

            '</div>' +


            '<div class="location-device">' +

                '<a href="' +
                    mapLink +
                '" target="_blank" rel="noopener noreferrer">' +

                    '🗺️ Open Location in Google Maps' +

                '</a>' +

            '</div>';


        locationList.appendChild(card);

    });

}


// ==================================================
// AUTOMATIC UPDATE
// ==================================================

setInterval(function () {

    if (notificationList) {
        loadNotifications();
    }

    if (locationList) {
        loadLocations();
    }

}, 10000);


// ==================================================
// FIRST LOAD
// ==================================================

if (accessToken) {

    if (notificationList) {
        loadNotifications();
    }

    if (locationList) {
        loadLocations();
    }

}
```

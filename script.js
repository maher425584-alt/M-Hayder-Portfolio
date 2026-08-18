// ==================================================
// MY HAYDER WEBSITE + PRIVATE PARENT DASHBOARD
// Notifications + Locations + Private Camera Photos
// ==================================================

document.addEventListener("DOMContentLoaded", function () {

    // ==================================================
    // MOBILE MENU
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

                        entry.target.style.transform =
                            "translateY(0)";

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

            element.style.transform =
                "translateY(25px)";

            element.style.transition =
                "opacity 0.6s ease, transform 0.6s ease";

            observer.observe(element);
        });
    }


    // ==================================================
    // SUPABASE
    // ==================================================

    // IMPORTANT:
    // ONLY actual Supabase URL here.
    // DO NOT use Markdown links.

    const SUPABASE_URL =
        "https://wfwxidbdyqwkqsbaxtlj.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_3OKrT7wF_P5P6vitgWpFJw_Opq-NvTr";

    const CAMERA_BUCKET =
        "camera-photos";


    // ==================================================
    // DASHBOARD SESSION
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

    const photoList =
        document.getElementById("photoList");

    const photoStatus =
        document.getElementById("photoStatus");

    const logoutButton =
        document.getElementById("logoutButton");


    // ==================================================
    // PRIVATE DASHBOARD SECURITY
    // ==================================================

    const isDashboard =
        notificationList ||
        locationList ||
        photoList ||
        logoutButton;

    if (isDashboard && !accessToken) {

        window.location.replace("login.html");

        return;
    }


    // ==================================================
    // LOGOUT
    // ==================================================

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                sessionStorage.removeItem(
                    "parent_access_token"
                );

                sessionStorage.removeItem(
                    "parent_refresh_token"
                );

                sessionStorage.removeItem(
                    "parent_user"
                );

                window.location.replace(
                    "login.html"
                );

            }
        );
    }


    // ==================================================
    // HTML SECURITY
    // ==================================================

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {
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

        if (!accessToken) {
            throw new Error("Login session expired");
        }

        return {
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + accessToken,
            "Content-Type": "application/json"
        };
    }


    // ==================================================
    // TABS
    // ==================================================

    const tabButtons =
        document.querySelectorAll(".tab-button");

    const tabContents =
        document.querySelectorAll(".tab-content");

    tabButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const targetId =
                    button.getAttribute("data-tab");

                tabButtons.forEach(function (item) {
                    item.classList.remove("active");
                });

                tabContents.forEach(function (content) {
                    content.classList.remove("active");
                });

                button.classList.add("active");

                const target =
                    document.getElementById(targetId);

                if (target) {
                    target.classList.add("active");
                }

            }
        );

    });


    // ==================================================
    // LOAD NOTIFICATIONS
    // ==================================================

    async function loadNotifications() {

        if (!notificationList) {
            return;
        }

        if (notificationStatus) {
            notificationStatus.textContent =
                "● Connecting...";
        }

        try {

            const url =
                SUPABASE_URL +
                "/rest/v1/notifications" +
                "?select=id,device_id,app_name,title,message,received_at" +
                "&order=received_at.desc" +
                "&limit=100";

            const response =
                await fetch(
                    url,
                    {
                        method: "GET",
                        headers: getSupabaseHeaders()
                    }
                );

            const responseText =
                await response.text();

            console.log(
                "Notifications Status:",
                response.status
            );

            if (!response.ok) {

                throw new Error(
                    "Supabase error " +
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
                    "Invalid Supabase response"
                );
            }

            displayNotifications(
                notifications
            );

            if (notificationStatus) {

                notificationStatus.textContent =
                    "● Connected • " +
                    notifications.length +
                    " notifications";
            }

        } catch (error) {

            console.error(
                "Notifications error:",
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
                        'Notifications from the Android app will appear here.' +
                    '</small>' +
                '</div>';

            return;
        }

        notificationList.innerHTML = "";

        notifications.forEach(
            function (notification) {

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

            }
        );
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
                "● Connecting...";
        }

        try {

            const url =
                SUPABASE_URL +
                "/rest/v1/locations" +
                "?select=id,created_at,device_id,latitude,longitude" +
                "&order=created_at.desc" +
                "&limit=100";

            const response =
                await fetch(
                    url,
                    {
                        method: "GET",
                        headers: getSupabaseHeaders()
                    }
                );

            const responseText =
                await response.text();

            console.log(
                "Locations Status:",
                response.status
            );

            if (!response.ok) {

                throw new Error(
                    "Supabase error " +
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
                    "Invalid Supabase response"
                );
            }

            displayLocations(
                locations
            );

            if (locationStatus) {

                locationStatus.textContent =
                    "● Connected • " +
                    locations.length +
                    " locations";
            }

        } catch (error) {

            console.error(
                "Locations error:",
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
                        'Location data from the Android app will appear here.' +
                    '</small>' +

                '</div>';

            return;
        }

        locationList.innerHTML = "";

        locations.forEach(
            function (location) {

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
                        new Date(
                            location.created_at
                        );

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

            }
        );
    }


    // ==================================================
    // LOAD PRIVATE CAMERA PHOTOS
    // ==================================================

    async function loadPhotos() {

        if (!photoList) {
            return;
        }

        if (photoStatus) {
            photoStatus.textContent =
                "● Connecting...";
        }

        try {

            const listUrl =
                SUPABASE_URL +
                "/storage/v1/object/list/" +
                CAMERA_BUCKET;

            const response =
                await fetch(
                    listUrl,
                    {
                        method: "POST",

                        headers:
                            getSupabaseHeaders(),

                        body: JSON.stringify({
                            prefix: "",
                            limit: 100,
                            offset: 0,
                            sortBy: {
                                column: "created_at",
                                order: "desc"
                            }
                        })
                    }
                );

            const responseText =
                await response.text();

            console.log(
                "Photos List Status:",
                response.status
            );

            if (!response.ok) {

                throw new Error(
                    "Photo storage error " +
                    response.status +
                    ": " +
                    responseText
                );
            }

            let files;

            try {

                files =
                    JSON.parse(responseText);

            } catch (error) {

                throw new Error(
                    "Invalid photo storage response"
                );
            }

            if (
                !Array.isArray(files) ||
                files.length === 0
            ) {

                displayPhotos([]);

                if (photoStatus) {
                    photoStatus.textContent =
                        "● Connected • 0 photos";
                }

                return;
            }


            // ==================================================
            // CREATE PHOTO ARRAY
            // ==================================================

            const photos = [];


            // ==================================================
            // CREATE SIGNED URL FOR EACH PHOTO
            // ==================================================

            for (const file of files) {

                if (
                    !file ||
                    !file.name
                ) {
                    continue;
                }

                const signedUrl =
                    await createSignedPhotoUrl(
                        file.name
                    );

                if (signedUrl) {

                    photos.push({

                        name:
                            file.name,

                        url:
                            signedUrl,

                        created_at:
                            file.created_at ||
                            file.updated_at ||
                            null
                    });
                }
            }


            // ==================================================
            // DISPLAY PHOTOS
            // ==================================================

            displayPhotos(photos);

            if (photoStatus) {

                photoStatus.textContent =
                    "● Connected • " +
                    photos.length +
                    " photos";
            }

        } catch (error) {

            console.error(
                "Photos error:",
                error
            );

            photoList.innerHTML =
                '<div class="photo-empty">' +

                    '<span>⚠️</span>' +

                    '<p class="error-message">' +
                        'Unable to load photos' +
                    '</p>' +

                    '<small>' +
                        escapeHTML(error.message) +
                    '</small>' +

                '</div>';

            if (photoStatus) {

                photoStatus.textContent =
                    "● Connection Error";
            }
        }
    }


    // ==================================================
    // CREATE PRIVATE SIGNED PHOTO URL
    // ==================================================

    async function createSignedPhotoUrl(fileName) {

        try {

            const signUrl =
                SUPABASE_URL +
                "/storage/v1/object/sign/" +
                CAMERA_BUCKET +
                "/" +
                encodeURIComponent(fileName);

            console.log(
                "Creating signed URL:",
                signUrl
            );

            const response =
                await fetch(
                    signUrl,
                    {
                        method: "POST",

                        headers:
                            getSupabaseHeaders(),

                        body: JSON.stringify({
                            expiresIn: 3600
                        })
                    }
                );

            const responseText =
                await response.text();

            console.log(
                "Signed URL Status:",
                response.status
            );

            if (!response.ok) {

                console.error(
                    "Signed URL error:",
                    response.status,
                    responseText
                );

                return null;
            }

            let result;

            try {

                result =
                    JSON.parse(responseText);

            } catch (error) {

                console.error(
                    "Invalid signed URL response:",
                    responseText
                );

                return null;
            }


            // ==================================================
            // SUPABASE signedURL
            // ==================================================

            if (result.signedURL) {

                if (
                    result.signedURL.startsWith("http")
                ) {
                    return result.signedURL;
                }

                return (
                    SUPABASE_URL +
                    "/storage/v1" +
                    result.signedURL
                );
            }


            // ==================================================
            // SUPABASE signedUrl
            // ==================================================

            if (result.signedUrl) {

                if (
                    result.signedUrl.startsWith("http")
                ) {
                    return result.signedUrl;
                }

                return (
                    SUPABASE_URL +
                    "/storage/v1" +
                    result.signedUrl
                );
            }


            console.error(
                "No signed URL returned:",
                result
            );

            return null;

        } catch (error) {

            console.error(
                "Signed photo error:",
                error
            );

            return null;
        }
    }


    // ==================================================
    // DISPLAY PRIVATE CAMERA PHOTOS
    // ==================================================

    function displayPhotos(photos) {

        if (!photoList) {
            return;
        }

        if (
            !Array.isArray(photos) ||
            photos.length === 0
        ) {

            photoList.innerHTML =
                '<div class="photo-empty">' +

                    '<span>📷</span>' +

                    '<p>No photos yet</p>' +

                    '<small>' +
                        'Photos captured by the Android camera will appear here.' +
                    '</small>' +

                '</div>';

            return;
        }

        photoList.innerHTML = "";


        // ==================================================
        // PHOTO GRID
        // ==================================================

        const grid =
            document.createElement("div");

        grid.className =
            "photo-grid";


        photos.forEach(
            function (photo) {

                const card =
                    document.createElement("div");

                card.className =
                    "photo-card";


                // ==================================================
                // TIME
                // ==================================================

                let formattedTime =
                    "Unknown time";

                if (photo.created_at) {

                    const date =
                        new Date(
                            photo.created_at
                        );

                    if (!isNaN(date.getTime())) {

                        formattedTime =
                            date.toLocaleString();
                    }
                }


                // ==================================================
                // PHOTO IMAGE
                // ==================================================

                const image =
                    document.createElement("img");

                image.src =
                    photo.url;

                image.alt =
                    "Camera Photo";

                image.loading =
                    "lazy";


                image.style.cursor =
                    "pointer";


                // ==================================================
                // CLICK IMAGE TO OPEN
                // ==================================================

                image.addEventListener(
                    "click",
                    function () {

                        window.open(
                            photo.url,
                            "_blank",
                            "noopener,noreferrer"
                        );

                    }
                );


                // ==================================================
                // IMAGE ERROR
                // ==================================================

                image.onerror =
                    function () {

                        console.error(
                            "Photo failed to load:",
                            photo.url
                        );

                        image.alt =
                            "Unable to load photo";

                    };


                // ==================================================
                // TOP
                // ==================================================

                const top =
                    document.createElement("div");

                top.className =
                    "photo-card-top";

                top.innerHTML =
                    '<strong>📷 Camera Photo</strong>' +

                    '<span>' +
                        escapeHTML(
                            formattedTime
                        ) +
                    '</span>';


                // ==================================================
                // INFO
                // ==================================================

                const info =
                    document.createElement("div");

                info.className =
                    "photo-info";

                info.innerHTML =

                    '<div class="photo-name">' +
                        escapeHTML(
                            photo.name
                        ) +
                    '</div>' +

                    '<div class="photo-time">' +
                        escapeHTML(
                            formattedTime
                        ) +
                    '</div>';


                // ==================================================
                // OPEN PHOTO BUTTON
                // ==================================================

                const openButton =
                    document.createElement("a");

                openButton.className =
                    "open-photo";

                openButton.href =
                    photo.url;

                openButton.target =
                    "_blank";

                openButton.rel =
                    "noopener noreferrer";

                openButton.textContent =
                    "Open Photo";


                info.appendChild(
                    openButton
                );


                // ==================================================
                // BUILD CARD
                // ==================================================

                card.appendChild(
                    top
                );

                card.appendChild(
                    image
                );

                card.appendChild(
                    info
                );

                grid.appendChild(
                    card
                );

            }
        );


        photoList.appendChild(
            grid
        );
    }


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

        if (photoList) {
            loadPhotos();
        }
    }


    // ==================================================
    // AUTO REFRESH
    // 10 SECONDS
    // ==================================================

    if (
        notificationList ||
        locationList ||
        photoList
    ) {

        setInterval(
            function () {

                if (notificationList) {
                    loadNotifications();
                }

                if (locationList) {
                    loadLocations();
                }

                if (photoList) {
                    loadPhotos();
                }

            },
            10000
        );
    }

});
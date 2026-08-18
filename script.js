// ==================================================
// MY HAYDER PRIVATE PARENT DASHBOARD
// Notifications + Locations + Camera Photos
// + Parent Camera Capture Request
// ==================================================

document.addEventListener("DOMContentLoaded", function () {

    // ==================================================
    // SUPABASE
    // ==================================================

    const SUPABASE_URL =
        "https://wfwxidbdyqwkqsbaxtlj.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_3OKrT7wF_P5P6vitgWpFJw_Opq-NvTr";

    const CAMERA_BUCKET =
        "camera-photos";

    const DEVICE_ID =
        "my-phone";

    // IMPORTANT:
    // Actual Supabase table name
    const CAPTURE_TABLE =
        "capture_requests";


    // ==================================================
    // SESSION
    // ==================================================

    const accessToken =
        sessionStorage.getItem("parent_access_token");


    // ==================================================
    // ELEMENTS
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
    // SECURITY
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
    // ESCAPE HTML
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
    // ADD CAPTURE BUTTON
    // ==================================================

    function addCaptureButton() {

        const dashboardTop =
            document.querySelector(
                "#photosTab .dashboard-top"
            );

        if (!dashboardTop) {
            return;
        }

        if (
            document.getElementById(
                "capturePhotoButton"
            )
        ) {
            return;
        }

        const button =
            document.createElement("button");

        button.id =
            "capturePhotoButton";

        button.type =
            "button";

        button.textContent =
            "📷 Capture Photo";

        button.style.marginTop =
            "15px";

        button.style.padding =
            "11px 18px";

        button.style.border =
            "none";

        button.style.borderRadius =
            "9px";

        button.style.background =
            "#2563eb";

        button.style.color =
            "white";

        button.style.fontWeight =
            "700";

        button.style.cursor =
            "pointer";

        button.addEventListener(
            "click",
            requestCapture
        );

        dashboardTop.appendChild(button);
    }


    // ==================================================
    // CREATE CAPTURE REQUEST
    // ==================================================

    async function requestCapture() {

        const button =
            document.getElementById(
                "capturePhotoButton"
            );

        if (button) {

            button.disabled = true;

            button.textContent =
                "⏳ Sending Request...";
        }

        try {

            const response =
                await fetch(
                    SUPABASE_URL +
                    "/rest/v1/" +
                    CAPTURE_TABLE,
                    {
                        method: "POST",

                        headers: {
                            ...getSupabaseHeaders(),

                            "Prefer":
                                "return=representation"
                        },

                        body: JSON.stringify({

                            device_id:
                                DEVICE_ID,

                            action:
                                "capture",

                            status:
                                "pending"
                        })
                    }
                );

            const text =
                await response.text();

            console.log(
                "Capture request status:",
                response.status
            );

            console.log(
                "Capture request response:",
                text
            );

            if (!response.ok) {

                throw new Error(
                    "Capture request failed: " +
                    response.status +
                    " " +
                    text
                );
            }

            if (photoStatus) {

                photoStatus.textContent =
                    "● Camera request sent • Waiting for child device";
            }

            alert(
                "Camera request sent successfully.\n\n" +
                "The child device can now approve/capture the requested photo."
            );

            watchCaptureRequest();

        } catch (error) {

            console.error(
                "Capture request error:",
                error
            );

            alert(
                "Could not send camera request:\n\n" +
                error.message
            );

            if (photoStatus) {

                photoStatus.textContent =
                    "● Capture request failed";
            }

        } finally {

            if (button) {

                button.disabled = false;

                button.textContent =
                    "📷 Capture Photo";
            }
        }
    }


    // ==================================================
    // WATCH CAPTURE STATUS
    // ==================================================

    let captureWatcher = null;

    function watchCaptureRequest() {

        if (captureWatcher) {

            clearInterval(
                captureWatcher
            );
        }

        let attempts = 0;

        captureWatcher =
            setInterval(
                async function () {

                    attempts++;

                    await checkLatestCapture();

                    if (attempts >= 60) {

                        clearInterval(
                            captureWatcher
                        );

                        captureWatcher = null;
                    }

                },
                3000
            );
    }


    // ==================================================
    // CHECK CAPTURE REQUEST STATUS
    // ==================================================

    async function checkLatestCapture() {

        try {

            const url =
                SUPABASE_URL +
                "/rest/v1/" +
                CAPTURE_TABLE +
                "?select=id,device_id,action,status,created_at,completed_at" +
                "&device_id=eq." +
                encodeURIComponent(DEVICE_ID) +
                "&action=eq.capture" +
                "&order=created_at.desc" +
                "&limit=1";

            const response =
                await fetch(
                    url,
                    {
                        method: "GET",

                        headers:
                            getSupabaseHeaders()
                    }
                );

            if (!response.ok) {

                const errorText =
                    await response.text();

                console.error(
                    "Capture status error:",
                    response.status,
                    errorText
                );

                return;
            }

            const rows =
                await response.json();

            if (
                !Array.isArray(rows) ||
                rows.length === 0
            ) {
                return;
            }

            const request =
                rows[0];

            if (!photoStatus) {
                return;
            }

            if (
                request.status ===
                "pending"
            ) {

                photoStatus.textContent =
                    "● Waiting for child device...";

            } else if (
                request.status ===
                "processing"
            ) {

                photoStatus.textContent =
                    "● Camera request accepted • Waiting for photo...";

            } else if (
                request.status ===
                "completed"
            ) {

                photoStatus.textContent =
                    "● Photo captured successfully";

                loadPhotos();

            } else if (
                request.status ===
                "cancelled"
            ) {

                photoStatus.textContent =
                    "● Camera request cancelled";

            } else if (
                request.status ===
                "failed"
            ) {

                photoStatus.textContent =
                    "● Camera request failed";

            } else {

                photoStatus.textContent =
                    "● Capture status: " +
                    request.status;
            }

        } catch (error) {

            console.error(
                "Capture status error:",
                error
            );
        }
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

                        headers:
                            getSupabaseHeaders()
                    }
                );

            const text =
                await response.text();

            if (!response.ok) {

                throw new Error(
                    "Supabase error " +
                    response.status +
                    ": " +
                    text
                );
            }

            const notifications =
                JSON.parse(text);

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

            if (notificationStatus) {

                notificationStatus.textContent =
                    "● Connection Error";
            }

            notificationList.innerHTML =
                `
                <div class="notification-empty">

                    <span>⚠️</span>

                    <p class="error-message">
                        Unable to load notifications
                    </p>

                    <small>
                        ${escapeHTML(error.message)}
                    </small>

                </div>
                `;
        }
    }


    // ==================================================
    // DISPLAY NOTIFICATIONS
    // ==================================================

    function displayNotifications(
        notifications
    ) {

        if (!notificationList) {
            return;
        }

        if (
            !Array.isArray(notifications) ||
            notifications.length === 0
        ) {

            notificationList.innerHTML =
                `
                <div class="notification-empty">

                    <span>🔔</span>

                    <p>
                        No notifications yet
                    </p>

                    <small>
                        Notifications from the Android app will appear here.
                    </small>

                </div>
                `;

            return;
        }

        notificationList.innerHTML = "";

        notifications.forEach(
            function (item) {

                const card =
                    document.createElement("div");

                card.className =
                    "notification-card";

                const time =
                    item.received_at
                        ? new Date(
                            item.received_at
                        ).toLocaleString()
                        : "Unknown";

                card.innerHTML =
                    `
                    <div class="notification-card-top">

                        <div class="notification-app">

                            📱
                            ${escapeHTML(
                                item.app_name ||
                                "Unknown App"
                            )}

                        </div>

                        <div class="notification-time">

                            ${escapeHTML(time)}

                        </div>

                    </div>

                    <div class="notification-title">

                        ${escapeHTML(
                            item.title ||
                            "Notification"
                        )}

                    </div>

                    <div class="notification-message">

                        ${escapeHTML(
                            item.message ||
                            ""
                        )}

                    </div>

                    <div class="notification-device">

                        Device:
                        ${escapeHTML(
                            item.device_id ||
                            "Unknown"
                        )}

                    </div>
                    `;

                notificationList.appendChild(
                    card
                );
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

                        headers:
                            getSupabaseHeaders()
                    }
                );

            const text =
                await response.text();

            if (!response.ok) {

                throw new Error(
                    "Supabase error " +
                    response.status +
                    ": " +
                    text
                );
            }

            const locations =
                JSON.parse(text);

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

            if (locationStatus) {

                locationStatus.textContent =
                    "● Connection Error";
            }

            locationList.innerHTML =
                `
                <div class="location-empty">

                    <span>⚠️</span>

                    <p class="error-message">
                        Unable to load locations
                    </p>

                    <small>
                        ${escapeHTML(error.message)}
                    </small>

                </div>
                `;
        }
    }


    // ==================================================
    // DISPLAY LOCATIONS
    // ==================================================

    function displayLocations(
        locations
    ) {

        if (!locationList) {
            return;
        }

        if (
            !Array.isArray(locations) ||
            locations.length === 0
        ) {

            locationList.innerHTML =
                `
                <div class="location-empty">

                    <span>📍</span>

                    <p>
                        No locations yet
                    </p>

                    <small>
                        Location data from the Android app will appear here.
                    </small>

                </div>
                `;

            return;
        }

        locationList.innerHTML = "";

        locations.forEach(
            function (item) {

                const lat =
                    item.latitude;

                const lng =
                    item.longitude;

                const time =
                    item.created_at
                        ? new Date(
                            item.created_at
                        ).toLocaleString()
                        : "Unknown";

                const card =
                    document.createElement("div");

                card.className =
                    "location-card";

                const map =
                    "https://www.google.com/maps?q=" +
                    encodeURIComponent(
                        lat + "," + lng
                    );

                card.innerHTML =
                    `
                    <div class="location-card-top">

                        <div class="notification-app">

                            📍 Location

                        </div>

                        <div class="location-time">

                            ${escapeHTML(time)}

                        </div>

                    </div>

                    <div class="location-coordinates">

                        <div class="coordinate-box">

                            <span class="coordinate-label">
                                Latitude
                            </span>

                            <span class="coordinate-value">
                                ${escapeHTML(lat)}
                            </span>

                        </div>

                        <div class="coordinate-box">

                            <span class="coordinate-label">
                                Longitude
                            </span>

                            <span class="coordinate-value">
                                ${escapeHTML(lng)}
                            </span>

                        </div>

                    </div>

                    <div class="location-device">

                        Device:
                        ${escapeHTML(
                            item.device_id ||
                            "Unknown"
                        )}

                    </div>

                    <div class="location-device">

                        <a
                            href="${map}"
                            target="_blank"
                            rel="noopener noreferrer">

                            🗺️ Open Google Maps

                        </a>

                    </div>
                    `;

                locationList.appendChild(
                    card
                );
            }
        );
    }


    // ==================================================
    // LOAD PHOTOS
    // ==================================================

    async function loadPhotos() {

        if (!photoList) {
            return;
        }

        if (photoStatus) {

            photoStatus.textContent =
                "● Loading photos...";
        }

        try {

            const url =
                SUPABASE_URL +
                "/storage/v1/object/list/" +
                CAMERA_BUCKET;

            const response =
                await fetch(
                    url,
                    {
                        method: "POST",

                        headers:
                            getSupabaseHeaders(),

                        body:
                            JSON.stringify({

                                prefix: "",

                                limit: 100,

                                offset: 0,

                                sortBy: {

                                    column:
                                        "created_at",

                                    order:
                                        "desc"
                                }
                            })
                    }
                );

            const text =
                await response.text();

            if (!response.ok) {

                throw new Error(
                    "Photo storage error " +
                    response.status +
                    ": " +
                    text
                );
            }

            const files =
                JSON.parse(text);

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

            const photos = [];

            for (
                const file of files
            ) {

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

            displayPhotos(
                photos
            );

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

            if (photoStatus) {

                photoStatus.textContent =
                    "● Photo Connection Error";
            }

            photoList.innerHTML =
                `
                <div class="photo-empty">

                    <span>⚠️</span>

                    <p class="error-message">
                        Unable to load photos
                    </p>

                    <small>
                        ${escapeHTML(error.message)}
                    </small>

                </div>
                `;
        }
    }


    // ==================================================
    // CREATE SIGNED PHOTO URL
    // ==================================================

    async function createSignedPhotoUrl(
        fileName
    ) {

        try {

            const url =
                SUPABASE_URL +
                "/storage/v1/object/sign/" +
                CAMERA_BUCKET +
                "/" +
                encodeURIComponent(
                    fileName
                );

            const response =
                await fetch(
                    url,
                    {
                        method: "POST",

                        headers:
                            getSupabaseHeaders(),

                        body:
                            JSON.stringify({
                                expiresIn: 3600
                            })
                    }
                );

            const text =
                await response.text();

            if (!response.ok) {

                console.error(
                    "Signed URL failed:",
                    response.status,
                    text
                );

                return null;
            }

            const result =
                JSON.parse(text);

            if (result.signedURL) {

                if (
                    result.signedURL.startsWith(
                        "http"
                    )
                ) {

                    return result.signedURL;
                }

                return (
                    SUPABASE_URL +
                    "/storage/v1" +
                    result.signedURL
                );
            }

            if (result.signedUrl) {

                if (
                    result.signedUrl.startsWith(
                        "http"
                    )
                ) {

                    return result.signedUrl;
                }

                return (
                    SUPABASE_URL +
                    "/storage/v1" +
                    result.signedUrl
                );
            }

            return null;

        } catch (error) {

            console.error(
                "Signed URL error:",
                error
            );

            return null;
        }
    }


    // ==================================================
    // DISPLAY PHOTOS
    // ==================================================

    function displayPhotos(
        photos
    ) {

        if (!photoList) {
            return;
        }

        if (
            !Array.isArray(photos) ||
            photos.length === 0
        ) {

            photoList.innerHTML =
                `
                <div class="photo-empty">

                    <span>📷</span>

                    <p>
                        No photos yet
                    </p>

                    <small>
                        Press "Capture Photo" to send a camera request.
                    </small>

                </div>
                `;

            return;
        }

        photoList.innerHTML = "";

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

                const time =
                    photo.created_at
                        ? new Date(
                            photo.created_at
                        ).toLocaleString()
                        : "Unknown";

                const top =
                    document.createElement("div");

                top.className =
                    "photo-card-top";

                top.innerHTML =
                    `
                    <strong>
                        📷 Camera Photo
                    </strong>

                    <span>
                        ${escapeHTML(time)}
                    </span>
                    `;

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

                image.addEventListener(
                    "click",
                    function () {

                        window.open(
                            photo.url,
                            "_blank"
                        );
                    }
                );

                image.onerror =
                    function () {

                        console.error(
                            "Image failed:",
                            photo.url
                        );

                        image.alt =
                            "Unable to load photo";
                    };

                const info =
                    document.createElement("div");

                info.className =
                    "photo-info";

                info.innerHTML =
                    `
                    <div class="photo-name">

                        ${escapeHTML(
                            photo.name
                        )}

                    </div>

                    <div class="photo-time">

                        ${escapeHTML(time)}

                    </div>
                    `;

                const open =
                    document.createElement("a");

                open.className =
                    "open-photo";

                open.href =
                    photo.url;

                open.target =
                    "_blank";

                open.rel =
                    "noopener noreferrer";

                open.textContent =
                    "Open Photo";

                info.appendChild(
                    open
                );

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
    // START DASHBOARD
    // ==================================================

    if (accessToken) {

        addCaptureButton();

        loadNotifications();

        loadLocations();

        loadPhotos();

        checkLatestCapture();
    }


    // ==================================================
    // AUTO REFRESH
    // ==================================================

    setInterval(
        function () {

            if (!accessToken) {
                return;
            }

            loadNotifications();

            loadLocations();

            loadPhotos();

            checkLatestCapture();

        },
        10000
    );

});
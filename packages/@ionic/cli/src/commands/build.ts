<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EchoNote: Interactive Mockup</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- 
      This is an interactive mockup. It uses your browser's "IndexedDB" to save audio,
      which is a database in your browser. A real app would use a cloud backend like Firebase.
      This simulation uses browser-based timing, which may be unreliable if the tab is closed.
      A real mobile app would use native notifications for 100% reliable delivery.
    -->
    <!-- Chosen Palette: Warm Neutrals (bg-stone-100, bg-white) with a calming Blue accent (bg-blue-600) -->
    <!-- Application Structure Plan: A mobile-first, tabbed interface. The three core user tasks are: 1) Record a new message, 2) See scheduled messages, 3) See played messages. This structure is intuitive and maps directly to the user's journey. A modal dialog will simulate the "incoming call" for a high-impact playback experience. -->
    <!-- Visualization & Content Choices: Report Info -> Goal -> Viz/Presentation -> Interaction -> Justification. 
        1. List of messages -> Inform/Organize -> Interactive List (HTML/Tailwind) -> Click to play/delete -> Standard pattern for managing data.
        2. Recording Status -> Inform -> Timer/Visual Feedback (JS/HTML) -> Start/Stop -> Gives user clear feedback on app state.
        3. Scheduled Playback -> Inform/Engage -> Modal Dialog (HTML/JS) -> "Answer" (play) / "Dismiss" -> Simulates the "call" feature, which is the app's key differentiator, making it feel more "real."
    -->
    <!-- CONFIRMATION: NO SVG graphics used. NO Mermaid JS used. -->
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
        
        /* Simple pulse animation for recording */
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .7; }
        }
        .recording {
            animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Modal styles */
        .modal {
            transition: opacity 0.25s ease;
        }
        .modal-content {
            transition: all 0.25s ease;
            transform: translateY(-20px);
        }
        .modal.opacity-100 .modal-content {
            transform: translateY(0);
        }
    </style>
</head>
<body class="bg-stone-100 flex items-center justify-center min-h-screen p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden" style="height: 80vh; display: flex; flex-direction: column;">
        
        <!-- Header -->
        <header class="bg-white p-4 shadow-sm z-10">
            <h1 class="text-2xl font-bold text-center text-blue-900">EchoNote</h1>
            <p class="text-center text-sm text-stone-500">Your Future Self is Calling</p>
            <!-- User ID will be shown here -->
            <p id="userIdDisplay" class="text-center text-xs text-stone-400 mt-1 truncate"></p>
        </header>

        <!-- Main Content Area (Scrollable) -->
        <main id="mainContent" class="flex-1 overflow-y-auto p-6 space-y-6">
            
            <!-- Tab: Record -->
            <div id="recordTab" class="space-y-6">
                <div id="recordState" class="text-center p-6 bg-stone-50 rounded-lg">
                    <p id="recordStatus" class="text-lg font-medium text-stone-700">Ready to Record</p>
                    <p id="recordTimer" class="text-3xl font-bold text-blue-800 my-4">00:00</p>
                    <button id="recordButton" class="w-20 h-20 bg-red-500 rounded-full shadow-lg text-white transition-all duration-300 ease-in-out hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 flex items-center justify-center mx-auto">
                        <!-- Record Icon (Circle) -->
                        <div class="w-8 h-8 bg-white rounded-full"></div>
                    </button>
                    <button id="stopButton" class="w-20 h-20 bg-blue-600 rounded-full shadow-lg text-white transition-all duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 items-center justify-center mx-auto hidden">
                        <!-- Stop Icon (Square) -->
                        <div class="w-8 h-8 bg-white rounded-md"></div>
                    </button>
                </div>
                
                <!-- Save Form (hidden initially) -->
                <div id="saveForm" class="hidden space-y-4 p-6 bg-blue-50 rounded-lg">
                    <h2 class="text-xl font-semibold text-blue-900">Save Your Echo</h2>
                    <div>
                        <label for="messageTitle" class="block text-sm font-medium text-stone-700">Title</label>
                        <input type="text" id="messageTitle" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="e.g., 'Pep Talk for Monday'">
                    </div>
                    <div>
                        <label for="scheduleTime" class="block text-sm font-medium text-stone-700">Schedule Playback</label>
                        <input type="datetime-local" id="scheduleTime" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                    </div>
                    <div class="flex gap-4">
                        <button id="saveButton" class="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Save Echo
                        </button>
                        <button id="discardButton" class="flex-1 inline-flex justify-center py-2 px-4 border border-stone-300 shadow-sm text-sm font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Discard
                        </button>
                    </div>
                </div>
            </div>

            <!-- Tab: Scheduled -->
            <div id="scheduledTab" class="hidden space-y-4">
                <h2 class="text-xl font-semibold text-blue-900">Scheduled Echos</h2>
                <div id="scheduledList" class="space-y-3">
                    <!-- Messages will be injected here -->
                    <p id="noScheduled" class="text-stone-500 text-center py-4">You have no scheduled messages.</p>
                </div>
            </div>

            <!-- Tab: Archive -->
            <div id="archiveTab" class="hidden space-y-4">
                <h2 class="text-xl font-semibold text-blue-900">Played Echos</h2>
                <div id="archiveList" class="space-y-3">
                    <!-- Messages will be injected here -->
                    <p id="noArchived" class="text-stone-500 text-center py-4">You have no played messages.</p>
                </div>
            </div>

            <!-- Global Audio Player (Hidden) -->
            <audio id="audioPlayer" controls class="w-full hidden"></audio>

        </main>

        <!-- Tab Navigation -->
        <nav class="bg-white grid grid-cols-3 shadow-inner-top border-t border-stone-200">
            <button data-tab="recordTab" class="tab-button p-4 text-center text-blue-600 border-t-2 border-blue-600 focus:outline-none">
                <span class="text-2xl">🎙️</span>
                <span class="block text-xs font-medium">Record</span>
            </button>
            <button data-tab="scheduledTab" class="tab-button p-4 text-center text-stone-500 border-t-2 border-transparent focus:outline-none">
                <span class="text-2xl">🗓️</span>
                <span class="block text-xs font-medium">Scheduled</span>
            </button>
            <button data-tab="archiveTab" class="tab-button p-4 text-center text-stone-500 border-t-2 border-transparent focus:outline-none">
                <span class="text-2xl">🗃️</span>
                <span class="block text-xs font-medium">Archive</span>
            </button>
        </nav>
    </div>

    <!-- "Incoming Call" Modal -->
    <div id="callModal" class="modal fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 opacity-0 pointer-events-none">
        <div class="modal-content bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-8 text-center">
            <h2 class="text-2xl font-bold text-blue-900">Incoming Echo</h2>
            <p class="text-stone-600 mt-2">A message from your past self is calling.</p>
            
            <div class="my-8">
                <div class="w-24 h-24 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-5xl">
                    👤
                </div>
            </div>
            
            <p id="callModalTitle" class="text-xl font-medium text-stone-800"></p>
            <p id="callModalTime" class="text-sm text-stone-500"></p>

            <div class="flex gap-4 mt-8">
                <button id="answerButton" class="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform hover:scale-105">
                    Answer
                </button>
                <button id="dismissButton" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform hover:scale-105">
                    Dismiss
                </button>
            </div>
        </div>
    </div>

    <!-- Custom Message Box -->
    <div id="messageBox" class="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 opacity-0 pointer-events-none">
        <div class="modal-content bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 id="messageBoxTitle" class="text-lg font-medium text-gray-900">Message</h3>
            <p id="messageBoxText" class="mt-2 text-sm text-gray-600">This is a message.</p>
            <div class="mt-4 text-right">
                <button id="messageBoxOk" class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    OK
                </button>
            </div>
        </div>
    </div>


    <!-- Firebase SDKs -->
    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { 
            getAuth, 
            signInAnonymously, 
            signInWithCustomToken,
            onAuthStateChanged 
        } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { 
            getFirestore, 
            doc, 
            setDoc, 
            addDoc,
            deleteDoc,
            collection, 
            query, 
            where, 
            onSnapshot,
            serverTimestamp,
            getDocs 
        } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // --- App State & Config ---
        let db, auth, userId;
        let mediaRecorder;
        let audioChunks = [];
        let recordedAudioBlob = null;
        let timerInterval;
        let playbackCheckInterval;
        
        // This prototype stores audio in a local JS object to avoid complex blob storage.
        // A real app would upload the blob to Firebase Storage and only store the URL.
        let localAudioStore = {}; 

        // --- Firebase Config (Provided by Environment) ---
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        let firebaseConfig;
        try {
            firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
        } catch (e) {
            console.error("Firebase config parsing error:", e);
            showMessage("Error", "Could not load app configuration.");
            firebaseConfig = {};
        }

        // --- Element References ---
        const mainContent = document.getElementById('mainContent');
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabs = {
            recordTab: document.getElementById('recordTab'),
            scheduledTab: document.getElementById('scheduledTab'),
            archiveTab: document.getElementById('archiveTab'),
        };
        const recordButton = document.getElementById('recordButton');
        const stopButton = document.getElementById('stopButton');
        const recordStatus = document.getElementById('recordStatus');
        const recordTimer = document.getElementById('recordTimer');
        const saveForm = document.getElementById('saveForm');
        const saveButton = document.getElementById('saveButton');
        const discardButton = document.getElementById('discardButton');
        const messageTitle = document.getElementById('messageTitle');
        const scheduleTime = document.getElementById('scheduleTime');
        const scheduledList = document.getElementById('scheduledList');
        const archiveList = document.getElementById('archiveList');
        const noScheduled = document.getElementById('noScheduled');
        const noArchived = document.getElementById('noArchived');
        const audioPlayer = document.getElementById('audioPlayer');
        const userIdDisplay = document.getElementById('userIdDisplay');

        // --- Modal References ---
        const callModal = document.getElementById('callModal');
        const callModalTitle = document.getElementById('callModalTitle');
        const callModalTime = document.getElementById('callModalTime');
        const answerButton = document.getElementById('answerButton');
        const dismissButton = document.getElementById('dismissButton');

        // --- Custom Message Box ---
        const messageBox = document.getElementById('messageBox');
        const messageBoxTitle = document.getElementById('messageBoxTitle');
        const messageBoxText = document.getElementById('messageBoxText');
        const messageBoxOk = document.getElementById('messageBoxOk');
        
        messageBoxOk.addEventListener('click', () => {
            messageBox.classList.add('opacity-0', 'pointer-events-none');
        });

        function showMessage(title, text) {
            messageBoxTitle.textContent = title;
            messageBoxText.textContent = text;
            messageBox.classList.remove('opacity-0', 'pointer-events-none');
        }

        // --- Core App Logic ---

        // 1. Initialization
        async function initialize() {
            if (!firebaseConfig.apiKey) {
                showMessage("Config Error", "Firebase configuration is missing. App cannot load.");
                return;
            }
            try {
                const app = initializeApp(firebaseConfig);
                db = getFirestore(app);
                auth = getAuth(app);
                
                onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        userId = user.uid;
                        userIdDisplay.textContent = `User ID: ${userId}`;
                        setupListeners();
                        startPlaybackCheck();
                    } else {
                        try {
                            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                                await signInWithCustomToken(auth, __initial_auth_token);
                            } else {
                                await signInAnonymously(auth);
                            }
                        } catch (authError) {
                            console.error("Authentication Error:", authError);
                            showMessage("Auth Error", "Could not sign in. Please refresh.");
                        }
                    }
                });

            } catch (e) {
                console.error("Firebase Init Error:", e);
                showMessage("Init Error", "Failed to initialize the app.");
            }
        }

        // 2. Tab Navigation
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                
                // Hide all tabs
                Object.values(tabs).forEach(tab => tab.classList.add('hidden'));
                
                // Deactivate all buttons
                tabButtons.forEach(btn => {
                    btn.classList.add('text-stone-500', 'border-transparent');
                    btn.classList.remove('text-blue-600', 'border-blue-600');
                });
                
                // Show selected tab
                tabs[tabId].classList.remove('hidden');
                
                // Activate selected button
                button.classList.remove('text-stone-500', 'border-transparent');
                button.classList.add('text-blue-600', 'border-blue-600');

                // Scroll to top
                mainContent.scrollTop = 0;
            });
        });

        // 3. Audio Recording
        async function startRecording() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                
                mediaRecorder.onstop = () => {
                    recordedAudioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    audioChunks = [];
                    stream.getTracks().forEach(track => track.stop());
                    
                    // Show save form
                    saveForm.classList.remove('hidden');
                    recordStatus.textContent = "Recording Finished";
                    recordButton.classList.remove('hidden');
                    stopButton.classList.add('hidden');
                    recordButton.classList.remove('recording', 'bg-red-500', 'hover:bg-red-600');
                    recordButton.classList.add('bg-stone-400', 'cursor-not-allowed');
                    recordButton.disabled = true;
                };

                mediaRecorder.start();
                
                // Update UI
                recordButton.classList.add('hidden');
                stopButton.classList.remove('hidden');
                recordButton.classList.add('recording');
                recordStatus.textContent = "Recording...";
                startTimer();

            } catch (err) {
                console.error("Audio permission denied:", err);
                showMessage("Permission Error", "You must allow microphone access to record an echo.");
            }
        }

        function stopRecording() {
            if (mediaRecorder && mediaRecorder.state === "recording") {
                mediaRecorder.stop();
                stopTimer();
            }
        }

        function startTimer() {
            let seconds = 0;
            recordTimer.textContent = "00:00";
            timerInterval = setInterval(() => {
                seconds++;
                const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
                const secs = String(seconds % 60).padStart(2, '0');
                recordTimer.textContent = `${mins}:${secs}`;
            }, 1000);
        }

        function stopTimer() {
            clearInterval(timerInterval);
        }

        function resetRecordUI() {
            saveForm.classList.add('hidden');
            messageTitle.value = "";
            scheduleTime.value = "";
            recordTimer.textContent = "00:00";
            recordStatus.textContent = "Ready to Record";
            recordedAudioBlob = null;
            recordButton.classList.remove('bg-stone-400', 'cursor-not-allowed');
            recordButton.classList.add('bg-red-500', 'hover:bg-red-600');
            recordButton.disabled = false;
        }

        // 4. Save & Discard
        async function saveEcho() {
            const title = messageTitle.value;
            const scheduleTimestamp = new Date(scheduleTime.value).getTime();

            if (!title || !scheduleTime.value || !recordedAudioBlob) {
                showMessage("Missing Info", "Please provide a title and a valid schedule time.");
                return;
            }
            
            if (scheduleTimestamp <= Date.now()) {
                showMessage("Invalid Time", "Please select a time in the future.");
                return;
            }

            try {
                // In a real app:
                // 1. Upload `recordedAudioBlob` to Firebase Storage.
                // 2. Get the `downloadURL`.
                // 3. Save the `downloadURL` in Firestore.
                
                // For this prototype, we save metadata to Firestore
                // and store the blob in our local JS object `localAudioStore`.
                
                const docData = {
                    userId: userId,
                    title: title,
                    scheduledTime: scheduleTimestamp,
                    status: "scheduled", // "scheduled" or "archived"
                    createdAt: serverTimestamp()
                };

                // Use the security-compliant private collection path
                const echosCollectionRef = collection(db, "artifacts", appId, "users", userId, "echos");
                const docRef = await addDoc(echosCollectionRef, docData);
                
                // Store audio blob locally using the new doc ID as the key
                localAudioStore[docRef.id] = recordedAudioBlob;
                
                showMessage("Success", "Your echo has been scheduled!");
                resetRecordUI();
                
                // Switch to scheduled tab
                tabButtons[1].click();

            } catch (e) {
                console.error("Error saving echo:", e);
                showMessage("Save Error", "Could not save your echo. Please try again.");
            }
        }

        // 5. Data Listeners (Real-time updates)
        function setupListeners() {
            if (!db || !userId) return;

            // Define the private, security-compliant collection path
            const echosCollectionRef = collection(db, "artifacts", appId, "users", userId, "echos");

            const qScheduled = query(
                echosCollectionRef,
                where("status", "==", "scheduled")
                // Removed redundant where("userId", "==", userId) as it's scoped by the collection path
            );
            
            const qArchived = query(
                echosCollectionRef,
                where("status", "==", "archived")
                // Removed redundant where("userId", "==", userId) as it's scoped by the collection path
            );

            onSnapshot(qScheduled, (snapshot) => {
                scheduledList.innerHTML = '';
                if (snapshot.empty) {
                    scheduledList.appendChild(noScheduled);
                } else {
                    snapshot.docs.forEach(doc => {
                        scheduledList.appendChild(createMessageElement(doc.data(), doc.id));
                    });
                }
            }, (error) => console.error("Snapshot error (scheduled):", error));
            
            onSnapshot(qArchived, (snapshot) => {
                archiveList.innerHTML = '';
                if (snapshot.empty) {
                    archiveList.appendChild(noArchived);
                } else {
                    snapshot.docs.forEach(doc => {
                        archiveList.appendChild(createMessageElement(doc.data(), doc.id));
                    });
                }
            }, (error) => console.error("Snapshot error (archived):", error));
        }

        function createMessageElement(data, id) {
            const div = document.createElement('div');
            div.className = "bg-white p-4 rounded-lg shadow-sm flex items-center justify-between";
            
            const textContent = document.createElement('div');
            const title = document.createElement('p');
            title.className = "font-medium text-stone-800";
            title.textContent = data.title;
            
            const time = document.createElement('p');
            time.className = "text-sm text-stone-500";
            time.textContent = new Date(data.scheduledTime).toLocaleString();
            
            textContent.appendChild(title);
            textContent.appendChild(time);
            
            const buttons = document.createElement('div');
            buttons.className = "flex gap-2";

            // Add play button
            const playButton = document.createElement('button');
            playButton.className = "w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-all";
            playButton.innerHTML = "▶️";
            playButton.onclick = () => playAudio(id);
            buttons.appendChild(playButton);

            // Add delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = "w-10 h-10 bg-stone-200 text-stone-600 rounded-full flex items-center justify-center hover:bg-stone-300 transition-all";
            deleteButton.innerHTML = "🗑️";
            deleteButton.onclick = () => deleteEcho(id);
            buttons.appendChild(deleteButton);

            div.appendChild(textContent);
            div.appendChild(buttons);
            return div;
        }

        // 6. Audio Playback
        function playAudio(id) {
            const audioBlob = localAudioStore[id];
            if (audioBlob) {
                const audioUrl = URL.createObjectURL(audioBlob);
                audioPlayer.src = audioUrl;
                audioPlayer.classList.remove('hidden');
                audioPlayer.play();
                
                // When playback finishes, mark as archived
                audioPlayer.onended = () => {
                    if(document.getElementById('callModal').classList.contains('opacity-0')) {
                        markAsArchived(id);
                    }
                };
            } else {
                // This would happen in a real app if the blob wasn't downloaded yet
                showMessage("Playback Error", "Audio file not found. It might still be loading.");
            }
        }
        
        async function deleteEcho(id) {
            try {
                // Use the security-compliant private document path
                const docRef = doc(db, "artifacts", appId, "users", userId, "echos", id);
                await deleteDoc(docRef);
                // Also delete from local store
                delete localAudioStore[id];
                showMessage("Deleted", "Echo has been deleted.");
            } catch (e) {
                console.error("Error deleting doc:", e);
                showMessage("Error", "Could not delete echo.");
            }
        }

        async function markAsArchived(id) {
            try {
                // Use the security-compliant private document path
                const docRef = doc(db, "artifacts", appId, "users", userId, "echos", id);
                await setDoc(docRef, { status: "archived" }, { merge: true });
            } catch (e) {
                console.error("Error archiving doc:", e);
            }
        }

        // 7. "The Call" Simulation
        function startPlaybackCheck() {
            if (playbackCheckInterval) clearInterval(playbackCheckInterval);
            
            // The interval is now async to properly use await getDocs
            playbackCheckInterval = setInterval(async () => {
                if (!userId) return; // Exit if user ID isn't set yet

                const now = Date.now();
                
                // Define the private, security-compliant collection path
                const echosCollectionRef = collection(db, "artifacts", appId, "users", userId, "echos");

                // FIX: Remove the scheduledTime filter to avoid the composite index requirement.
                const qScheduled = query(
                    echosCollectionRef,
                    where("status", "==", "scheduled")
                );
                
                try {
                    // Get all scheduled messages
                    const snapshot = await getDocs(qScheduled);

                    // Client-side filtering to check the scheduled time. This is necessary to avoid the index error.
                    const docToPlay = snapshot.docs.find(doc => doc.data().scheduledTime <= now);

                    if (docToPlay) {
                        triggerCallModal(docToPlay.data(), docToPlay.id);
                    }
                } catch (e) {
                    console.error("Error checking playback:", e);
                    // Do not show a full error message to the user for silent check failures
                }
            }, 10000); // Check every 10 seconds
        }

        function triggerCallModal(data, id) {
            // Check if a call is already in progress
            if (!callModal.classList.contains('opacity-0')) {
                return;
            }

            callModalTitle.textContent = data.title;
            callModalTime.textContent = new Date(data.scheduledTime).toLocaleString();
            
            callModal.classList.remove('opacity-0', 'pointer-events-none');
            
            answerButton.onclick = () => {
                callModal.classList.add('opacity-0', 'pointer-events-none');
                playAudio(id);
                // Mark as archived *after* it's played
                audioPlayer.onended = () => {
                    markAsArchived(id);
                    audioPlayer.classList.add('hidden');
                }
            };
            
            dismissButton.onclick = () => {
                callModal.classList.add('opacity-0', 'pointer-events-none');
                // Mark as archived even if dismissed
                markAsArchived(id); 
            };
        }

        // --- Event Listeners ---
        recordButton.addEventListener('click', startRecording);
        stopButton.addEventListener('click', stopRecording);
        saveButton.addEventListener('click', saveEcho);
        discardButton.addEventListener('click', resetRecordUI);

        // --- Start The App ---
        initialize();

    </script>
</body>
</html>

// メイプルストーリー ボス・クエスト管理アプリ

// ========== 免責事項チェック ==========
function checkDisclaimer() {
    const agreed = localStorage.getItem('disclaimerAgreed');
    if (!agreed) {
        showDisclaimerModal();
        return false;
    }
    return true;
}

function showDisclaimerModal() {
    const overlay = document.createElement('div');
    overlay.id = 'disclaimer-overlay';
    overlay.innerHTML = `
        <div class="disclaimer-modal">
            <h2>⚠️ 免責事項</h2>
            <p>このアプリケーションの利用は<strong>自己責任</strong>でお願いします。</p>
            <p>データの損失やその他の問題について、開発者は一切の責任を負いません。</p>
            <div class="disclaimer-buttons">
                <button id="disclaimer-agree-btn" class="disclaimer-btn agree">同意する</button>
                <button id="disclaimer-decline-btn" class="disclaimer-btn decline">同意しない</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('disclaimer-agree-btn').addEventListener('click', () => {
        localStorage.setItem('disclaimerAgreed', 'true');
        overlay.remove();
        // コンテナを再表示してページをリロード
        const container = document.querySelector('.container');
        if (container) container.style.display = '';
        location.reload();
    });

    document.getElementById('disclaimer-decline-btn').addEventListener('click', () => {
        window.close();
        // window.close() が動作しない場合のフォールバック
        document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;color:white;font-size:1.5rem;">ページを閉じてください</div>';
    });
}

// デフォルトサーバー名
const DEFAULT_SERVER_NAMES = ['かえで', 'くるみ', 'けやき', 'くぬぎ', 'チャレンジ'];

// デフォルトキャラ名
const DEFAULT_CHAR_NAMES = ['①', '②', '③', '④', '⑤', '⑥', '⑦'];

// 全ボスリスト
const ALL_BOSSES = [
    'スウ', 'デミアン', 'スライム', 'ルシード', 'ウィル',
    'ダスク', 'デュンケル', '真ヒルラ', 'セレン', 'カロス',
    'カリーン', 'リンボ', 'バルド', '対敵者', 'ブラックメイジ'
];

// 設定をロード（なければ現在の設定で初期化）
function loadSettings() {
    const saved = localStorage.getItem('mapleSettings');
    if (saved) {
        return JSON.parse(saved);
    }
    // 初期設定（一般的な名前）
    return {
        servers: [
            {
                name: 'サーバー1',
                characters: [
                    { name: 'キャラ①', bosses: [...ALL_BOSSES] },
                    { name: 'キャラ②', bosses: ALL_BOSSES.filter(b => !['カリーン', 'リンボ', 'バルド', '対敵者'].includes(b)) }
                ]
            }
        ]
    };
}

// 設定を保存
function saveSettings(settings) {
    localStorage.setItem('mapleSettings', JSON.stringify(settings));
}

// 設定からSERVERS形式のデータを取得
function getServers() {
    const settings = loadSettings();
    return settings.servers.map(s => ({
        name: s.name,
        characters: s.characters.map(c => c.name)
    }));
}

// 動的にSERVERSを取得
let SERVERS = getServers();

// ボス・クエストデータ（JMS 2025-2026 現行実装）
const DATA = {
    weeklyBosses: [
        'スウ', 'デミアン', 'スライム', 'ルシード', 'ウィル',
        'ダスク', 'デュンケル', '真ヒルラ', 'セレン', 'カロス'
    ],
    // ルティス専用ボス（かえでサーバーのルティスのみ表示）
    rutisOnlyBosses: ['カリーン', 'リンボ', 'バルド', '対敵者'],
    monthlyBosses: ['ブラックメイジ'],
    weeklyQuests: ['モンパEX', 'ハイマウンテン', 'アングラーカンパニー', 'エルダの頼み', '紅き月']
};

// オーセンティックフォース必要数データ（JMS基準）
// ダメージ125%達成には要求AF+50が必要
const AUTHENTIC_SYMBOL_DATA = {
    'セレン': {
        difficulties: [
            { name: 'ノーマル', phases: ['P1: 150', 'P2: 200'], maxDmg: 250 },
            { name: 'ハード', phases: ['P1: 150', 'P2: 200'], maxDmg: 250 },
            { name: 'エクストリーム', phases: ['P1: 150', 'P2: 200'], maxDmg: 250 }
        ]
    },
    'カロス': {
        difficulties: [
            { name: 'イージー', phases: ['P1: 200', 'P2: 200'], maxDmg: 250 },
            { name: 'ノーマル', phases: ['P1: 250', 'P2: 300'], maxDmg: 350 },
            { name: 'カオス', phases: ['P1: 330', 'P2: 330'], maxDmg: 380 },
            { name: 'エクストリーム', phases: ['P1: 440', 'P2: 330'], maxDmg: 490 }
        ]
    },
    'カリーン': {
        difficulties: [
            { name: 'イージー', phases: ['230'], maxDmg: 280 },
            { name: 'ノーマル', phases: ['330'], maxDmg: 380 },
            { name: 'ハード', phases: ['350'], maxDmg: 400 },
            { name: 'エクストリーム', phases: ['480'], maxDmg: 530 }
        ]
    },
    'リンボ': {
        difficulties: [
            { name: 'ノーマル', phases: ['430～500'], maxDmg: 550 },
            { name: 'ハード', phases: ['430～500'], maxDmg: 550 }
        ]
    },
    '対敵者': {
        difficulties: [
            { name: 'ノーマル', phases: ['500+'], maxDmg: 550 },
            { name: 'ハード', phases: ['500+'], maxDmg: 550 }
        ]
    },
    'バルド': {
        difficulties: [
            { name: 'ノーマル', phases: ['500+'], maxDmg: 550 }
        ]
    }
};

//（かえでサーバーの最初のキャラ）
function isRutis(serverIndex, charIndex) {
    return serverIndex === 0 && charIndex === 0;
}

// 状態管理
let currentServer = 'all'; // 0, 1, 2 または 'all'
let serverData = loadData();

// 全キャラクター情報を取得（全サーバーモード用）
function getAllCharacters() {
    const result = [];
    SERVERS.forEach((server, serverIndex) => {
        server.characters.forEach((charName, charIndex) => {
            result.push({
                serverIndex,
                serverName: server.name,
                charIndex,
                charName,
                displayName: `${charName}`
            });
        });
    });
    return result;
}

// ローカルストレージからデータを読み込み
function loadData() {
    const saved = localStorage.getItem('mapleTracker');
    if (saved) {
        const parsed = JSON.parse(saved);
        if (!isValidDataStructure(parsed)) {
            console.log('古いデータ形式を検出。新しい形式で初期化します。');
            return createEmptyData();
        }
        // SERVERSの構造に合わせてデータを同期
        syncDataWithServers(parsed);
        checkAndResetIfNeeded(parsed);
        return parsed;
    }
    return createEmptyData();
}

// データをSERVERSの構造に同期
function syncDataWithServers(data) {
    // サーバー数を合わせる
    while (data.servers.length < SERVERS.length) {
        data.servers.push({ characters: [] });
    }
    while (data.servers.length > SERVERS.length) {
        data.servers.pop();
    }

    // 各サーバーのキャラ数を合わせる
    SERVERS.forEach((server, sIdx) => {
        const serverData = data.servers[sIdx];
        while (serverData.characters.length < server.characters.length) {
            serverData.characters.push(createCharacterData());
        }
        while (serverData.characters.length > server.characters.length) {
            serverData.characters.pop();
        }
    });
}

// データ構造が正しいかチェック（基本チェックのみ）
function isValidDataStructure(data) {
    if (!data || !data.servers || !Array.isArray(data.servers)) return false;

    // 基本的な構造のみチェック（サーバー数・キャラ数は動的に変わるので厳密チェックしない）
    for (const server of data.servers) {
        if (!server || !server.characters || !Array.isArray(server.characters)) return false;

        for (const char of server.characters) {
            if (!char || typeof char.weeklyBosses !== 'object' ||
                typeof char.monthlyBosses !== 'object' ||
                typeof char.weeklyQuests !== 'object') {
                return false;
            }
        }
    }
    return true;
}

// 空のデータ構造を作成
function createEmptyData() {
    const servers = SERVERS.map(server => ({
        characters: server.characters.map(() => createCharacterData())
    }));
    return {
        servers: servers,
        lastWeeklyReset: getLastWeeklyReset().toISOString(),
        lastMonthlyReset: getLastMonthlyReset().toISOString()
    };
}

// キャラクターごとのデータ構造
function createCharacterData() {
    return { weeklyBosses: {}, monthlyBosses: {}, weeklyQuests: {} };
}

// 週間リセット日を取得（木曜日 00:00）
function getLastWeeklyReset() {
    const now = new Date();
    const day = now.getDay();
    const diff = (day + 3) % 7;
    const lastThursday = new Date(now);
    lastThursday.setDate(now.getDate() - diff);
    lastThursday.setHours(0, 0, 0, 0);
    return lastThursday;
}

function getNextWeeklyReset() {
    const lastReset = getLastWeeklyReset();
    const nextReset = new Date(lastReset);
    nextReset.setDate(nextReset.getDate() + 7);
    return nextReset;
}

function getLastMonthlyReset() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
}

function getNextMonthlyReset() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
}

// リセットが必要かチェックしてリセット
function checkAndResetIfNeeded(data) {
    const lastWeekly = new Date(data.lastWeeklyReset);
    const lastMonthly = new Date(data.lastMonthlyReset);
    const currentWeeklyReset = getLastWeeklyReset();
    const currentMonthlyReset = getLastMonthlyReset();

    if (currentWeeklyReset > lastWeekly) {
        data.servers.forEach(server => {
            server.characters.forEach(char => {
                char.weeklyBosses = {};
                char.weeklyQuests = {};
            });
        });
        data.lastWeeklyReset = currentWeeklyReset.toISOString();

        // 過去のスケジュールを自動削除
        cleanupPastSchedules();
    }

    if (currentMonthlyReset > lastMonthly) {
        data.servers.forEach(server => {
            server.characters.forEach(char => {
                char.monthlyBosses = {};
            });
        });
        data.lastMonthlyReset = currentMonthlyReset.toISOString();
    }
    saveData(data);
}

function saveData(data) {
    localStorage.setItem('mapleTracker', JSON.stringify(data || serverData));
}

// メインコンテンツをレンダリング
function renderContent() {
    const main = document.getElementById('main-content');

    main.innerHTML = `
        <section class="category">
            <div class="category-header">
                <h2>⚔️ 週間ボス</h2>
            </div>
            <div class="tracker-table" id="weekly-boss-table"></div>
        </section>
        
        <section class="category">
            <div class="category-header">
                <h2>👑 月間ボス</h2>
            </div>
            <div class="tracker-table" id="monthly-boss-table"></div>
        </section>
        
        <section class="category">
            <div class="category-header">
                <h2>📜 ウィークリー (260LV+)</h2>
            </div>
            <div class="tracker-table" id="weekly-quest-table"></div>
        </section>
        
        <section class="category schedule-section">
            <div class="category-header schedule-header">
                <h2>📅 協力討伐スケジュール</h2>
                <div class="schedule-header-actions">
                    <button id="schedule-notify-btn" class="schedule-notify-btn" style="display: none;" title="5分前にブラウザ通知を送ります">🔔 通知を許可</button>
                    <button id="schedule-copy-all-btn" class="schedule-copy-all-btn" title="全スケジュールをコピー">📋 一括コピー</button>
                </div>
            </div>
            <div class="schedule-container" id="schedule-container"></div>
        </section>
    `;

    // 週間ボス（通常 + 専用）
    const allWeeklyBosses = [...DATA.weeklyBosses, ...DATA.rutisOnlyBosses];
    renderTable('weekly-boss-table', allWeeklyBosses, 'weeklyBosses');
    renderTable('monthly-boss-table', DATA.monthlyBosses, 'monthlyBosses');
    renderTable('weekly-quest-table', DATA.weeklyQuests, 'weeklyQuests');
    renderSchedule();

    // 通知ボタンの制御
    const notifyBtn = document.getElementById('schedule-notify-btn');
    if (notifyBtn) {
        if ('Notification' in window) {
            notifyBtn.style.display = 'inline-block';
            if (Notification.permission === 'granted') {
                notifyBtn.textContent = '🔔 通知ON';
                notifyBtn.style.opacity = '0.7';
                notifyBtn.style.cursor = 'default';
                notifyBtn.title = '通知はすでに許可されています';
            } else if (Notification.permission === 'denied') {
                notifyBtn.textContent = '🔕 通知ブロック中';
                notifyBtn.style.opacity = '0.7';
                notifyBtn.style.cursor = 'default';
                notifyBtn.title = 'ブラウザの設定でブロックされているか、ローカルファイル(file://)での閲覧のため制限されています。';
            } else {
                notifyBtn.addEventListener('click', () => {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            notifyBtn.textContent = '🔔 通知ON';
                            notifyBtn.style.opacity = '0.7';
                            notifyBtn.style.cursor = 'default';
                            new Notification("通知が有効になりました", { body: "スケジュールの5分前にお知らせします。" });
                        } else if (permission === 'denied') {
                            notifyBtn.textContent = '🔕 通知ブロック中';
                            notifyBtn.style.opacity = '0.7';
                            notifyBtn.style.cursor = 'default';
                        }
                    });
                });
            }
        } else {
            notifyBtn.style.display = 'inline-block';
            notifyBtn.textContent = '🔕 通知非対応ブラウザ';
            notifyBtn.style.opacity = '0.7';
            notifyBtn.style.cursor = 'default';
        }
    }

    // 一括コピーボタンのイベントリスナー
    const copyAllBtn = document.getElementById('schedule-copy-all-btn');
    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', copyAllSchedules);
    }
}

// テーブルをレンダリング
function renderTable(tableId, items, dataKey, isRutisOnly = false) {
    const table = document.getElementById(tableId);
    const isAllServers = currentServer === 'all';

    // キャラクター情報を取得
    let charInfoList;
    if (isAllServers) {
        charInfoList = getAllCharacters();
    } else {
        charInfoList = SERVERS[currentServer].characters.map((charName, charIndex) => ({
            serverIndex: currentServer,
            serverName: SERVERS[currentServer].name,
            charIndex,
            charName,
            displayName: charName
        }));
    }

    // 固定表示列数（最大7キャラに合わせる）
    const MAX_DISPLAY_COLS = 7;
    const emptyColsCount = Math.max(0, MAX_DISPLAY_COLS - charInfoList.length);

    let html = '<table><thead><tr><th class="item-col">項目</th>';
    // 週間ボスの場合はヘッダーに全チェックボタンを配置
    if (dataKey === 'weeklyBosses') {
        charInfoList.forEach((info, idx) => {
            html += `<th class="char-col">
                <button class="check-all-btn header-btn" data-idx="${idx}" data-server="${info.serverIndex}" data-char="${info.charIndex}" data-key="${dataKey}">全チェック</button>
                <div class="char-name">${info.displayName}</div>
            </th>`;
        });
    } else {
        charInfoList.forEach(info => {
            html += `<th class="char-col">${info.displayName}</th>`;
        });
    }

    // 空のヘッダー列を追加
    for (let i = 0; i < emptyColsCount; i++) {
        html += '<th class="char-col"></th>';
    }

    html += '</tr></thead><tbody>';

    items.forEach(item => {
        // ボス表示のフィルタリング（週間・月間ボスのみ）
        if (dataKey === 'weeklyBosses' || dataKey === 'monthlyBosses') {
            // 誰もこのボスを選択していなければスキップ
            if (!isBossSelectedByAnyone(item)) {
                return;
            }
        }

        // シャスタ専用ボスかどうか判定
        const isRutisOnlyBoss = isRutisOnly || DATA.rutisOnlyBosses.includes(item);

        // 制限付きアイテムの判定
        const isMonpaEX = item === 'モンパEX';
        const isGlobalLimit = ['ハイマウンテン', 'アングラーカンパニー', 'エルダの頼み'].includes(item);

        let rowClass = '';
        let badgeHtml = '';

        // 全サーバー表示時は制限表示を変更
        if (isGlobalLimit) {
            let serversCompleted = 0;
            serverData.servers.forEach((server) => {
                const hasCheck = server.characters.some(char => char[dataKey][item]);
                if (hasCheck) serversCompleted++;
            });
            if (serversCompleted >= 1) {
                rowClass = 'limit-reached';
            }
            badgeHtml = ` <span class="limit-badge ${serversCompleted >= 1 ? '' : 'badge-progress'}">${serversCompleted}/1鯖</span>`;
        }

        // オーセンティックフォースのツールチップを生成
        let tooltipClass = '';
        let tooltipData = '';
        const symbolData = AUTHENTIC_SYMBOL_DATA[item];
        if (symbolData) {
            const lines = symbolData.difficulties.map(d => {
                const phaseInfo = d.phases.join(', ');
                return `${d.name}: ${phaseInfo} (125%: ${d.maxDmg})`;
            });
            tooltipClass = ' has-tooltip';
            tooltipData = ` data-tooltip="🔷 オーセンティックフォース必要数\n${lines.join('\n')}"`;
        }

        html += `<tr class="${rowClass}"><td class="item-name${tooltipClass}"${tooltipData}>${item}${badgeHtml}</td>`;
        charInfoList.forEach((info) => {
            const charData = serverData.servers[info.serverIndex].characters[info.charIndex];

            // ルティス専用ボスはルティス以外非表示、または設定で選択されていない場合も非表示
            const isBossHidden = isRutisOnlyBoss && !isRutis(info.serverIndex, info.charIndex);
            const isNotSelectedBoss = (dataKey === 'weeklyBosses' || dataKey === 'monthlyBosses') &&
                !shouldShowBoss(info.serverIndex, info.charIndex, item);

            if (isBossHidden || isNotSelectedBoss) {
                html += `<td class="check-cell"><div class="check-box hidden"></div></td>`;
            } else {
                const checked = charData[dataKey][item] ? 'checked' : '';

                // 制限チェック
                let disabled = '';
                if (isMonpaEX && !charData[dataKey][item]) {
                    // 同サーバー内で2キャラ到達チェック
                    let count = 0;
                    serverData.servers[info.serverIndex].characters.forEach(c => {
                        if (c[dataKey][item]) count++;
                    });
                    if (count >= 2) disabled = 'disabled';
                }
                if (isGlobalLimit && !charData[dataKey][item]) {
                    // 同サーバー内で既にチェック済みか
                    const hasCheck = serverData.servers[info.serverIndex].characters.some(c => c[dataKey][item]);
                    if (hasCheck) disabled = 'disabled';
                }

                // スケジュールアイコンの判定（週間・月間ボスのみ）
                let scheduleIcon = '';
                if (dataKey === 'weeklyBosses' || dataKey === 'monthlyBosses') {
                    const schedules = loadScheduleData();
                    const matchingSchedule = schedules.find(s =>
                        s.boss === item && s.char === info.charName && new Date(s.datetime) >= new Date()
                    );
                    if (matchingSchedule) {
                        const schedDate = new Date(matchingSchedule.datetime);
                        const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
                        const month = schedDate.getMonth() + 1;
                        const day = schedDate.getDate();
                        const dayName = dayNames[schedDate.getDay()];
                        const hours = String(schedDate.getHours()).padStart(2, '0');
                        const minutes = String(schedDate.getMinutes()).padStart(2, '0');
                        const originMarkers = { '1': '①', '2': '②', '3': '③' };
                        const originSuffix = matchingSchedule.origin ? originMarkers[matchingSchedule.origin] || '' : '';
                        const tooltipText = `${month}月${day}日(${dayName})${hours}:${minutes}${originSuffix ? ' ' + originSuffix : ''}`;
                        scheduleIcon = `<span class="schedule-icon" data-tooltip="${tooltipText}">📅</span>`;
                    }
                }

                html += `<td class="check-cell">
                    <div class="check-cell-content">
                        <div class="check-box ${checked} ${disabled}" data-item="${item}" data-server="${info.serverIndex}" data-char="${info.charIndex}" data-key="${dataKey}"></div>
                        ${scheduleIcon}
                    </div>
                </td>`;
            }
        });

        // 空のセルを追加
        for (let i = 0; i < emptyColsCount; i++) {
            html += '<td class="check-cell"></td>';
        }

        html += '</tr>';
    });

    html += '</tbody></table>';

    table.innerHTML = html;

    // チェックボックスイベント
    table.querySelectorAll('.check-box').forEach(box => {
        box.addEventListener('click', () => {
            const item = box.dataset.item;
            const srvIndex = parseInt(box.dataset.server);
            const charIndex = parseInt(box.dataset.char);
            const key = box.dataset.key;
            const charData = serverData.servers[srvIndex].characters[charIndex];
            const isGlobalLimit = ['ハイマウンテン', 'アングラーカンパニー', 'エルダの頼み'].includes(item);

            // モンパEXの制限チェック
            if (item === 'モンパEX' && !charData[key][item]) {
                let currentCount = 0;
                serverData.servers[srvIndex].characters.forEach(c => {
                    if (c[key][item]) currentCount++;
                });
                if (currentCount >= 2) {
                    return;
                }
            }

            // 全サーバー各1回制限のチェック
            if (isGlobalLimit && !charData[key][item]) {
                const hasCheck = serverData.servers[srvIndex].characters.some(c => c[key][item]);
                if (hasCheck) {
                    return;
                }
            }

            charData[key][item] = !charData[key][item];
            saveData();

            // 制限付きアイテムの場合は行全体を再描画
            if (item === 'モンパEX' || isGlobalLimit) {
                renderTable(tableId, items, dataKey);
            } else {
                box.classList.toggle('checked');
            }
        });
    });

    // 一括チェックボタンイベント
    table.querySelectorAll('.check-all-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const srvIndex = parseInt(btn.dataset.server);
            const charIndex = parseInt(btn.dataset.char);
            const key = btn.dataset.key;
            // items引数には対敵者なども含まれているのでそのまま使用する
            const charData = serverData.servers[srvIndex].characters[charIndex];

            const allChecked = items.every(item => charData[key][item]);
            items.forEach(item => {
                charData[key][item] = !allChecked;
            });
            saveData();
            renderTable(tableId, items, dataKey);
        });
    });
}

// カウントダウンを更新
function updateCountdowns() {
    const now = new Date();

    // 現在時刻を表示
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    const currentDayName = dayNames[now.getDay()];
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentDatetimeEl = document.getElementById('current-datetime');
    if (currentDatetimeEl) {
        currentDatetimeEl.textContent = `${currentMonth}月${currentDay}日(${currentDayName}) ${currentHours}:${currentMinutes}`;
    }

    const nextWeekly = getNextWeeklyReset();
    const weeklyDiff = nextWeekly - now;
    document.getElementById('weekly-countdown').textContent = formatCountdown(weeklyDiff);

    const nextMonthly = getNextMonthlyReset();
    const monthlyDiff = nextMonthly - now;
    document.getElementById('monthly-countdown').textContent = formatCountdown(monthlyDiff);

    // スケジュール通知のチェック
    checkScheduleNotifications();
}

function formatCountdown(ms) {
    if (ms < 0) return 'リセット済み';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}日 ${hours}時間`;
    return `${hours}時間 ${minutes}分`;
}

// サーバータブの初期化
function initServerTabs() {
    const tabs = document.querySelectorAll('.server-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const serverValue = tab.dataset.server;
            currentServer = serverValue === 'all' ? 'all' : parseInt(serverValue);
            updateResetButtonVisibility();
            renderContent();
        });
    });
}

// リセットボタンの表示/非表示を更新
function updateResetButtonVisibility() {
    const resetServerBtn = document.getElementById('reset-server');
    if (currentServer === 'all') {
        resetServerBtn.style.display = 'none';
    } else {
        resetServerBtn.style.display = '';
    }
}

// リセットボタンの初期化
function initResetButtons() {
    document.getElementById('reset-server').addEventListener('click', () => {
        if (currentServer === 'all') return;
        const serverName = SERVERS[currentServer].name;
        if (confirm(`${serverName} の全キャラクターをリセットしますか？`)) {
            SERVERS[currentServer].characters.forEach((_, i) => {
                serverData.servers[currentServer].characters[i] = createCharacterData();
            });
            saveData();
            renderContent();
        }
    });

    document.getElementById('reset-all').addEventListener('click', () => {
        if (confirm('すべてのデータをリセットしますか？')) {
            serverData = createEmptyData();
            saveData();
            renderContent();
        }
    });
}

// 初期化
function init() {
    initServerTabs();
    initResetButtons();
    initSettingsModal();
    updateServerTabs();
    renderContent();
    updateCountdowns();
    setInterval(updateCountdowns, 60000);
    setInterval(() => {
        checkAndResetIfNeeded(serverData);
        renderContent();
    }, 3600000);
}

document.addEventListener('DOMContentLoaded', init);

// スケジュールデータの読み込み
function loadScheduleData() {
    const saved = localStorage.getItem('mapleSchedule');
    if (saved) {
        return JSON.parse(saved);
    }
    return [];
}

// スケジュールデータの保存
function saveScheduleData(data) {
    localStorage.setItem('mapleSchedule', JSON.stringify(data));
}

// スケジュール通知のチェック処理
function checkScheduleNotifications() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const schedules = loadScheduleData();
    const now = new Date();

    // 既に通知済みのスケジュールIDを取得
    const notifiedStr = localStorage.getItem('mapleNotifiedSchedules');
    let notifiedSchedules = notifiedStr ? JSON.parse(notifiedStr) : [];
    let updated = false;

    schedules.forEach(schedule => {
        // 既に通知済みの場合はスキップ
        if (notifiedSchedules.includes(schedule.id)) return;

        const schedDate = new Date(schedule.datetime);
        const timeDiff = schedDate.getTime() - now.getTime();
        const minutesDiff = timeDiff / (1000 * 60);

        // 5分以内になった場合 (0分より大きく、5分以下)
        if (minutesDiff > 0 && minutesDiff <= 5) {
            const timeStr = schedDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

            const title = `[まもなく] ${schedule.boss}`;
            const body = `${schedule.char ? schedule.char + ' ' : ''}${timeStr} 開始予定です！`;

            new Notification(title, {
                body: body
            });

            notifiedSchedules.push(schedule.id);
            updated = true;
        }
    });

    if (updated) {
        // 直近50件まで保存
        if (notifiedSchedules.length > 50) {
            notifiedSchedules = notifiedSchedules.slice(-50);
        }
        localStorage.setItem('mapleNotifiedSchedules', JSON.stringify(notifiedSchedules));
    }
}

// 過去のスケジュールを削除
function cleanupPastSchedules() {
    const schedules = loadScheduleData();
    const now = new Date();
    const filtered = schedules.filter(s => new Date(s.datetime) >= now);
    if (filtered.length !== schedules.length) {
        saveScheduleData(filtered);
        console.log(`${schedules.length - filtered.length}件の過去スケジュールを削除しました`);
    }
}

// 全ボスリストを取得
function getAllBosses() {
    return [...DATA.weeklyBosses, ...DATA.rutisOnlyBosses, ...DATA.monthlyBosses];
}

// スケジュールをレンダリング
function renderSchedule() {
    const container = document.getElementById('schedule-container');
    const schedules = loadScheduleData();
    const allBosses = getAllBosses();
    const allCharacters = getAllCharacters();

    let html = `
        <div class="schedule-add">
            <select id="schedule-boss" class="schedule-input">
                <option value="">ボスを選択...</option>
                ${allBosses.map(boss => `<option value="${boss}">${boss}</option>`).join('')}
            </select>
            <select id="schedule-char" class="schedule-input">
                <option value="">キャラを選択...</option>
                ${allCharacters.map(c => `<option value="${c.charName}">${c.charName} (${c.serverName})</option>`).join('')}
            </select>
            <input type="date" id="schedule-date" class="schedule-input">
            <div class="time-picker-wrapper" id="time-picker-wrapper">
                <div class="time-picker-display schedule-input" id="time-picker-display">時間...</div>
                <input type="hidden" id="schedule-time" value="">
                <div class="time-picker-dropdown" id="time-picker-dropdown">
                    <div class="time-picker-scroll" id="time-picker-scroll"></div>
                </div>
            </div>
            <select id="schedule-origin" class="schedule-input schedule-origin-select">
                <option value="">オリジン...</option>
                <option value="1">🌐 1番目</option>
                <option value="2">🌐 2番目</option>
                <option value="3">🌐 3番目</option>
            </select>
            <input type="text" id="schedule-memo" class="schedule-input" placeholder="メモ（参加者など）">
            <button id="schedule-add-btn" class="schedule-btn">追加</button>
        </div>
        <div class="schedule-list">
    `;

    // スケジュールを日時順にソート
    const sortedSchedules = [...schedules].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    if (sortedSchedules.length === 0) {
        html += '<p class="schedule-empty">スケジュールはありません</p>';
    } else {
        sortedSchedules.forEach((schedule, index) => {
            const date = new Date(schedule.datetime);
            const dateStr = date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' });
            const timeStr = date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
            const isPast = date < new Date();

            // オリジン順番の表示
            const originLabels = { '1': 'オリジン1番目', '2': 'オリジン2番目', '3': 'オリジン3番目' };
            const originHtml = schedule.origin ? `<span class="schedule-origin-badge">${originLabels[schedule.origin]}</span>` : '';

            // 日付に基づくクラスの判定 (本日、今週、来週)
            const now = new Date();
            const currentWeeklyReset = getLastWeeklyReset();
            const nextWeeklyReset = getNextWeeklyReset();
            const nextNextWeeklyReset = new Date(nextWeeklyReset);
            nextNextWeeklyReset.setDate(nextNextWeeklyReset.getDate() + 7);

            const isToday = date.getFullYear() === now.getFullYear() &&
                date.getMonth() === now.getMonth() &&
                date.getDate() === now.getDate();
            const isThisWeek = date >= currentWeeklyReset && date < nextWeeklyReset;
            const isNextWeek = date >= nextWeeklyReset && date < nextNextWeeklyReset;

            let periodClass = '';
            if (isToday) {
                periodClass = 'today';
            } else if (isThisWeek) {
                periodClass = 'this-week';
            } else if (isNextWeek) {
                periodClass = 'next-week';
            }

            html += `
                <div class="schedule-item ${isPast ? 'past' : ''} ${periodClass}" data-id="${schedule.id}">
                    <div class="schedule-info">
                        <span class="schedule-boss-name">${schedule.boss}</span>
                        ${schedule.char ? `<span class="schedule-char-name">${schedule.char}</span>` : ''}
                        <span class="schedule-date">${dateStr} ${timeStr}</span>
                        ${originHtml}
                        <button class="schedule-edit-btn" data-id="${schedule.id}" title="日時を変更">✏️</button>
                        ${schedule.memo ? `<span class="schedule-memo">${schedule.memo}</span>` : ''}
                    </div>
                    <div class="schedule-actions">
                        <button class="schedule-copy-btn" data-id="${schedule.id}" title="日程をコピー">日程コピー</button>
                        <button class="schedule-repeat-btn" data-id="${schedule.id}" title="来週も同じ時間でスケジュール">🔁</button>
                        <button class="schedule-delete-btn" data-id="${schedule.id}">✕</button>
                    </div>
                </div>
            `;
        });
    }

    html += '</div>';
    container.innerHTML = html;

    // イベントリスナーを追加
    document.getElementById('schedule-add-btn').addEventListener('click', addSchedule);
    container.querySelectorAll('.schedule-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteSchedule(btn.dataset.id));
    });
    container.querySelectorAll('.schedule-repeat-btn').forEach(btn => {
        btn.addEventListener('click', () => repeatNextWeek(btn.dataset.id));
    });
    container.querySelectorAll('.schedule-copy-btn').forEach(btn => {
        btn.addEventListener('click', () => copyScheduleDate(btn.dataset.id));
    });
    container.querySelectorAll('.schedule-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => startEditSchedule(btn.dataset.id));
    });

    // カスタム時間ピッカーを初期化
    initTimePicker();
}

// カスタム時間ピッカーの初期化
function initTimePicker() {
    const wrapper = document.getElementById('time-picker-wrapper');
    const display = document.getElementById('time-picker-display');
    const dropdown = document.getElementById('time-picker-dropdown');
    const scrollContainer = document.getElementById('time-picker-scroll');
    const hiddenInput = document.getElementById('schedule-time');

    if (!wrapper || !display || !dropdown || !scrollContainer) return;

    // 5分刻みの時間オプションを生成
    const timeOptions = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 5) {
            const hh = h.toString().padStart(2, '0');
            const mm = m.toString().padStart(2, '0');
            timeOptions.push(`${hh}:${mm}`);
        }
    }

    // 循環スクロール用に3セット分のアイテムを生成
    const totalItems = timeOptions.length; // 288
    const itemHeight = 36;

    function buildItems() {
        scrollContainer.innerHTML = '';
        // 3セット生成（前・中央・後）
        for (let set = 0; set < 3; set++) {
            timeOptions.forEach((time, idx) => {
                const item = document.createElement('div');
                item.className = 'time-picker-item';
                item.textContent = time;
                item.dataset.value = time;
                item.dataset.index = idx;
                item.addEventListener('click', () => {
                    hiddenInput.value = time;
                    display.textContent = time;
                    display.classList.add('selected');
                    dropdown.classList.remove('open');
                    // 選択状態を更新
                    scrollContainer.querySelectorAll('.time-picker-item').forEach(el => {
                        el.classList.toggle('active', el.dataset.value === time);
                    });
                });
                scrollContainer.appendChild(item);
            });
        }
    }

    buildItems();

    // 中央セットの先頭にスクロール位置を設定
    function resetToCenter() {
        scrollContainer.scrollTop = totalItems * itemHeight;
    }

    // スクロール位置を監視して循環させる
    scrollContainer.addEventListener('scroll', () => {
        const scrollTop = scrollContainer.scrollTop;
        const oneSetHeight = totalItems * itemHeight;

        // 上端を超えたら中央セットにジャンプ
        if (scrollTop < oneSetHeight * 0.25) {
            scrollContainer.scrollTop = scrollTop + oneSetHeight;
        }
        // 下端を超えたら中央セットにジャンプ
        else if (scrollTop > oneSetHeight * 1.75) {
            scrollContainer.scrollTop = scrollTop - oneSetHeight;
        }
    });

    // ドロップダウンの開閉
    display.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('open');
        if (isOpen) {
            dropdown.classList.remove('open');
        } else {
            dropdown.classList.add('open');
            // 選択済みの時間があればその位置にスクロール
            const selectedValue = hiddenInput.value;
            if (selectedValue) {
                const idx = timeOptions.indexOf(selectedValue);
                if (idx >= 0) {
                    // 中央セットの選択位置にスクロール（中央に表示）
                    const targetScroll = (totalItems + idx) * itemHeight - dropdown.clientHeight / 2 + itemHeight / 2;
                    scrollContainer.scrollTop = targetScroll;
                }
            } else {
                resetToCenter();
            }
        }
    });

    // 外部クリックで閉じる
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
}


// スケジュール追加
function addSchedule() {
    const boss = document.getElementById('schedule-boss').value;
    const char = document.getElementById('schedule-char').value;
    const date = document.getElementById('schedule-date').value;
    const time = document.getElementById('schedule-time').value;
    const origin = document.getElementById('schedule-origin').value;
    const memo = document.getElementById('schedule-memo').value;

    if (!boss || !date || !time) {
        alert('ボス、日付、時間を選択してください');
        return;
    }

    const datetime = `${date}T${time}`;

    const schedules = loadScheduleData();
    schedules.push({
        id: Date.now().toString(),
        boss,
        char,
        datetime,
        origin,
        memo
    });

    saveScheduleData(schedules);
    renderContent();

    // 入力をクリア
    document.getElementById('schedule-boss').value = '';
    document.getElementById('schedule-char').value = '';
    document.getElementById('schedule-date').value = '';
    document.getElementById('schedule-time').value = '';
    const timeDisplay = document.getElementById('time-picker-display');
    if (timeDisplay) {
        timeDisplay.textContent = '時間...';
        timeDisplay.classList.remove('selected');
    }
    document.getElementById('schedule-origin').value = '';
    document.getElementById('schedule-memo').value = '';
}

// スケジュール削除
function deleteSchedule(id) {
    const schedules = loadScheduleData();
    const filtered = schedules.filter(s => s.id !== id);
    saveScheduleData(filtered);
    renderContent();
}

// 来週同じ時間でスケジュールを複製
function repeatNextWeek(id) {
    const schedules = loadScheduleData();
    const original = schedules.find(s => s.id === id);
    if (!original) return;

    const originalDate = new Date(original.datetime);
    const nextWeekDate = new Date(originalDate);
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);

    // ISO形式で datetime を作成
    const year = nextWeekDate.getFullYear();
    const month = String(nextWeekDate.getMonth() + 1).padStart(2, '0');
    const day = String(nextWeekDate.getDate()).padStart(2, '0');
    const hours = String(nextWeekDate.getHours()).padStart(2, '0');
    const minutes = String(nextWeekDate.getMinutes()).padStart(2, '0');
    const newDatetime = `${year}-${month}-${day}T${hours}:${minutes}`;

    schedules.push({
        id: Date.now().toString(),
        boss: original.boss,
        char: original.char,
        datetime: newDatetime,
        origin: original.origin || '',
        memo: original.memo
    });

    saveScheduleData(schedules);
    renderContent();
}

// 日程をコピー
function copyScheduleDate(id) {
    const schedules = loadScheduleData();
    const schedule = schedules.find(s => s.id === id);
    if (!schedule) return;

    const date = new Date(schedule.datetime);
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayName = dayNames[date.getDay()];
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const copyText = `${month}月${day}日(${dayName})${hours}:${minutes}`;

    navigator.clipboard.writeText(copyText).catch(err => {
        console.error('コピーに失敗しました:', err);
    });
}

// 全スケジュールを一括コピー（スプレッドシート用タブ区切り）
function copyAllSchedules() {
    const schedules = loadScheduleData();
    // 未来のスケジュールのみ対象、日時順にソート
    const futureSchedules = schedules
        .filter(s => new Date(s.datetime) >= new Date())
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    if (futureSchedules.length === 0) {
        alert('コピーするスケジュールがありません');
        return;
    }

    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const originLabels = { '1': '1番目', '2': '2番目', '3': '3番目' };

    // ヘッダー行
    let lines = ['ボス\tキャラ\t日時\tオリジン\tメモ'];

    futureSchedules.forEach(schedule => {
        const date = new Date(schedule.datetime);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayName = dayNames[date.getDay()];
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const dateStr = `${month}/${day}(${dayName}) ${hours}:${minutes}`;
        const originStr = schedule.origin ? originLabels[schedule.origin] || '' : '';

        lines.push(`${schedule.boss}\t${schedule.char || ''}\t${dateStr}\t${originStr}\t${schedule.memo || ''}`);
    });

    const copyText = lines.join('\n');
    navigator.clipboard.writeText(copyText).then(() => {
        const btn = document.getElementById('schedule-copy-all-btn');
        if (btn) {
            const original = btn.textContent;
            btn.textContent = '✅ コピー済み';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = original;
                btn.classList.remove('copied');
            }, 2000);
        }
    }).catch(err => {
        console.error('コピーに失敗しました:', err);
    });
}

// スケジュールの日時を編集開始
function startEditSchedule(id) {
    const schedules = loadScheduleData();
    const schedule = schedules.find(s => s.id === id);
    if (!schedule) return;

    const itemEl = document.querySelector(`.schedule-item[data-id="${id}"]`);
    if (!itemEl) return;

    const infoEl = itemEl.querySelector('.schedule-info');
    const dateSpan = infoEl.querySelector('.schedule-date');
    const editBtn = infoEl.querySelector('.schedule-edit-btn');

    // 既に編集中の場合は何もしない
    if (infoEl.querySelector('.schedule-edit-form')) return;

    const currentDate = new Date(schedule.datetime);
    const dateValue = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    const timeValue = `${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;

    // 5分刻みの時間オプションを生成
    const timeOptions = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 5) {
            const hh = h.toString().padStart(2, '0');
            const mm = m.toString().padStart(2, '0');
            timeOptions.push(`${hh}:${mm}`);
        }
    }

    // インライン編集フォームを作成
    const editForm = document.createElement('div');
    editForm.className = 'schedule-edit-form';
    editForm.innerHTML = `
        <input type="date" class="schedule-edit-date schedule-input" value="${dateValue}">
        <select class="schedule-edit-time schedule-input">
            ${timeOptions.map(t => `<option value="${t}" ${t === timeValue ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
        <button class="schedule-edit-save-btn" title="保存">✓</button>
        <button class="schedule-edit-cancel-btn" title="キャンセル">✕</button>
    `;

    // 日付表示と編集ボタンを非表示にして編集フォームを挿入
    dateSpan.style.display = 'none';
    editBtn.style.display = 'none';
    dateSpan.after(editForm);

    // 保存ボタン
    editForm.querySelector('.schedule-edit-save-btn').addEventListener('click', () => {
        const newDate = editForm.querySelector('.schedule-edit-date').value;
        const newTime = editForm.querySelector('.schedule-edit-time').value;
        if (!newDate || !newTime) {
            alert('日付と時間を入力してください');
            return;
        }
        saveEditSchedule(id, `${newDate}T${newTime}`);
    });

    // キャンセルボタン
    editForm.querySelector('.schedule-edit-cancel-btn').addEventListener('click', () => {
        editForm.remove();
        dateSpan.style.display = '';
        editBtn.style.display = '';
    });
}

// スケジュールの日時を保存
function saveEditSchedule(id, newDatetime) {
    const schedules = loadScheduleData();
    const schedule = schedules.find(s => s.id === id);
    if (!schedule) return;

    schedule.datetime = newDatetime;
    saveScheduleData(schedules);
    renderContent();
}

// ========== 設定モーダル機能 ==========

let currentSettingsTab = 'servers';
let tempSettings = null;

// 設定モーダルを開く
function openSettings() {
    tempSettings = JSON.parse(JSON.stringify(loadSettings()));
    document.getElementById('settings-modal').classList.add('active');
    renderSettingsContent();
}

// 設定モーダルを閉じる
function closeSettings() {
    document.getElementById('settings-modal').classList.remove('active');
    tempSettings = null;
}

// 設定を保存して閉じる
function saveAndCloseSettings() {
    saveSettings(tempSettings);
    SERVERS = getServers();

    // serverDataを新しい構造に合わせて再構築
    rebuildServerData();

    closeSettings();
    updateServerTabs();
    renderContent();
}

// serverDataを設定に合わせて再構築
function rebuildServerData() {
    syncDataWithServers(serverData);
    saveData();
}

// サーバータブを更新
function updateServerTabs() {
    const nav = document.querySelector('.server-tabs');
    const allActive = currentServer === 'all' ? 'active' : '';
    let html = `<button class="server-tab ${allActive}" data-server="all">全サーバー</button>`;
    SERVERS.forEach((server, i) => {
        const active = currentServer === i ? 'active' : '';
        html += `<button class="server-tab ${active}" data-server="${i}">${server.name}</button>`;
    });
    nav.innerHTML = html;
    initServerTabs();
}

// 設定タブ切り替え
function switchSettingsTab(tab) {
    currentSettingsTab = tab;
    document.querySelectorAll('.modal-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });
    renderSettingsContent();
}

// 設定コンテンツを描画
function renderSettingsContent() {
    const container = document.getElementById('settings-content');

    switch (currentSettingsTab) {
        case 'servers':
            renderServerSettings(container);
            break;
        case 'characters':
            renderCharacterSettings(container);
            break;
        case 'bosses':
            renderBossSettings(container);
            break;
    }
}

// サーバー設定を描画
function renderServerSettings(container) {
    // 未使用のサーバー名を取得
    const usedNames = tempSettings.servers.map(s => s.name);
    const availableServers = DEFAULT_SERVER_NAMES.filter(name => !usedNames.includes(name));

    let html = '<div class="settings-list">';

    tempSettings.servers.forEach((server, i) => {
        html += `
            <div class="settings-item">
                <input type="text" value="${server.name}" data-server="${i}" class="server-name-input">
                <button class="settings-item-btn" onclick="deleteServer(${i})" ${tempSettings.servers.length <= 1 ? 'disabled' : ''}>削除</button>
            </div>
        `;
    });

    if (tempSettings.servers.length < 5 && availableServers.length > 0) {
        html += `
            <div class="settings-item add-server-row">
                <select id="new-server-select" class="settings-select" style="margin-bottom: 0; flex: 1;">
                    ${availableServers.map(name => `<option value="${name}">${name}</option>`).join('')}
                </select>
                <button class="settings-add-btn" style="flex: none; width: auto; padding: 0.5rem 1rem;" onclick="addServerFromSelect()">追加</button>
            </div>
        `;
    } else if (tempSettings.servers.length < 5) {
        html += `<button class="settings-add-btn" onclick="addServer()">+ サーバー追加</button>`;
    }

    html += '</div>';
    container.innerHTML = html;

    // 名前変更イベント
    container.querySelectorAll('.server-name-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.server);
            tempSettings.servers[idx].name = e.target.value;
        });
    });
}

// サーバー追加（デフォルト名）
function addServer() {
    if (tempSettings.servers.length >= 5) return;
    const nextIdx = tempSettings.servers.length;
    const defaultName = DEFAULT_SERVER_NAMES[nextIdx] || `サーバー${nextIdx + 1}`;
    tempSettings.servers.push({
        name: defaultName,
        characters: []
    });
    renderSettingsContent();
}

// サーバー追加（ドロップダウンから選択）
function addServerFromSelect() {
    if (tempSettings.servers.length >= 5) return;
    const select = document.getElementById('new-server-select');
    const serverName = select.value;
    tempSettings.servers.push({
        name: serverName,
        characters: []
    });
    renderSettingsContent();
}

// サーバー削除
function deleteServer(idx) {
    if (tempSettings.servers.length <= 1) return;
    if (!confirm(`「${tempSettings.servers[idx].name}」を削除しますか？\nこのサーバーのキャラクターデータも削除されます。`)) return;
    tempSettings.servers.splice(idx, 1);
    renderSettingsContent();
}

// キャラクター設定を描画
function renderCharacterSettings(container) {
    let html = `
        <select class="settings-select" id="char-server-select">
            ${tempSettings.servers.map((s, i) => `<option value="${i}">${s.name}</option>`).join('')}
        </select>
        <div id="char-list"></div>
    `;
    container.innerHTML = html;

    const select = document.getElementById('char-server-select');
    select.addEventListener('change', () => renderCharacterList(parseInt(select.value)));
    renderCharacterList(0);
}

// キャラクターリストを描画
function renderCharacterList(serverIdx) {
    const listContainer = document.getElementById('char-list');
    const server = tempSettings.servers[serverIdx];

    let html = '<div class="settings-list">';

    server.characters.forEach((char, i) => {
        html += `
            <div class="settings-item">
                <input type="text" value="${char.name}" data-server="${serverIdx}" data-char="${i}" class="char-name-input">
                <button class="settings-item-btn" onclick="deleteCharacter(${serverIdx}, ${i})">削除</button>
            </div>
        `;
    });

    if (server.characters.length < 7) {
        html += `<button class="settings-add-btn" onclick="addCharacter(${serverIdx})">+ キャラ追加</button>`;
    }

    html += '</div>';
    listContainer.innerHTML = html;

    // 名前変更イベント
    listContainer.querySelectorAll('.char-name-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const srvIdx = parseInt(e.target.dataset.server);
            const charIdx = parseInt(e.target.dataset.char);
            tempSettings.servers[srvIdx].characters[charIdx].name = e.target.value;
        });
    });
}

// キャラクター追加
function addCharacter(serverIdx) {
    const server = tempSettings.servers[serverIdx];
    if (server.characters.length >= 7) return;

    // 使用済みの名前を取得
    const usedNames = server.characters.map(c => c.name);

    // 未使用の名前を探す
    let defaultName = '';
    for (const name of DEFAULT_CHAR_NAMES) {
        if (!usedNames.includes(name)) {
            defaultName = name;
            break;
        }
    }
    // すべて使用済みの場合はフォールバック
    if (!defaultName) {
        defaultName = `キャラ${server.characters.length + 1}`;
    }

    server.characters.push({
        name: defaultName,
        bosses: [...ALL_BOSSES]
    });
    renderCharacterList(serverIdx);
}

// キャラクター削除
function deleteCharacter(serverIdx, charIdx) {
    const char = tempSettings.servers[serverIdx].characters[charIdx];
    if (!confirm(`「${char.name}」を削除しますか？`)) return;
    tempSettings.servers[serverIdx].characters.splice(charIdx, 1);
    renderCharacterList(serverIdx);
}

// ボス設定を描画
function renderBossSettings(container) {
    // 全キャラクターのリストを生成
    const allChars = [];
    tempSettings.servers.forEach((server, sIdx) => {
        server.characters.forEach((char, cIdx) => {
            allChars.push({ serverIdx: sIdx, charIdx: cIdx, name: `${char.name} (${server.name})` });
        });
    });

    if (allChars.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">キャラクターが登録されていません</p>';
        return;
    }

    let html = `
        <select class="settings-select" id="boss-char-select">
            ${allChars.map((c, i) => `<option value="${i}">${c.name}</option>`).join('')}
        </select>
        <div id="boss-grid"></div>
    `;
    container.innerHTML = html;

    const select = document.getElementById('boss-char-select');
    select.addEventListener('change', () => renderBossGrid(allChars, parseInt(select.value)));
    renderBossGrid(allChars, 0);
}

// ボスグリッドを描画
function renderBossGrid(allChars, selectedIdx) {
    const gridContainer = document.getElementById('boss-grid');
    const charInfo = allChars[selectedIdx];
    const char = tempSettings.servers[charInfo.serverIdx].characters[charInfo.charIdx];

    let html = '<div class="boss-grid">';

    ALL_BOSSES.forEach(boss => {
        const checked = char.bosses.includes(boss) ? 'checked' : '';
        html += `
            <div class="boss-check">
                <input type="checkbox" id="boss-${boss}" ${checked} data-boss="${boss}" data-server="${charInfo.serverIdx}" data-char="${charInfo.charIdx}">
                <label for="boss-${boss}">${boss}</label>
            </div>
        `;
    });

    html += '</div>';
    gridContainer.innerHTML = html;

    // チェックボックスイベント
    gridContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const boss = e.target.dataset.boss;
            const sIdx = parseInt(e.target.dataset.server);
            const cIdx = parseInt(e.target.dataset.char);
            const charObj = tempSettings.servers[sIdx].characters[cIdx];

            if (e.target.checked) {
                if (!charObj.bosses.includes(boss)) {
                    charObj.bosses.push(boss);
                }
            } else {
                charObj.bosses = charObj.bosses.filter(b => b !== boss);
            }
        });
    });
}

// 設定モーダルの初期化
function initSettingsModal() {
    document.getElementById('open-settings').addEventListener('click', openSettings);
    document.getElementById('close-settings').addEventListener('click', closeSettings);
    document.getElementById('save-settings').addEventListener('click', saveAndCloseSettings);
    document.getElementById('export-settings').addEventListener('click', exportData);
    document.getElementById('import-settings').addEventListener('click', () => document.getElementById('import-file').click());
    document.getElementById('import-file').addEventListener('change', importData);

    // タブ切り替え
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.addEventListener('click', () => switchSettingsTab(tab.dataset.tab));
    });

    // オーバーレイクリックで閉じる
    document.getElementById('settings-modal').addEventListener('click', (e) => {
        if (e.target.id === 'settings-modal') closeSettings();
    });
}

// データをエクスポート
function exportData() {
    const data = {
        version: 1,
        exportDate: new Date().toISOString(),
        settings: loadSettings(),
        trackerData: JSON.parse(localStorage.getItem('mapleTracker') || '{}'),
        scheduleData: loadScheduleData()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maple-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// データをインポート
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);

            if (!data.settings) {
                alert('無効なファイル形式です');
                return;
            }

            if (!confirm('現在のデータを上書きしますか？\n（設定、チェック状態、スケジュールがすべて置き換わります）')) {
                return;
            }

            // 設定をインポート
            saveSettings(data.settings);
            SERVERS = getServers();

            // トラッカーデータをインポート
            if (data.trackerData) {
                localStorage.setItem('mapleTracker', JSON.stringify(data.trackerData));
                serverData = loadData();
            }

            // スケジュールデータをインポート
            if (data.scheduleData) {
                saveScheduleData(data.scheduleData);
            }

            closeSettings();
            updateServerTabs();
            renderContent();
            alert('インポートが完了しました！');
        } catch (err) {
            alert('ファイルの読み込みに失敗しました: ' + err.message);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

// キャラクターがボスを表示するかチェック
function shouldShowBoss(serverIndex, charIndex, bossName) {
    const settings = loadSettings();
    if (!settings.servers[serverIndex]) return false;
    const char = settings.servers[serverIndex].characters[charIndex];
    if (!char) return false;
    return char.bosses.includes(bossName);
}

// ボスが誰かに選択されているかチェック
function isBossSelectedByAnyone(bossName) {
    const settings = loadSettings();
    return settings.servers.some(server =>
        server.characters.some(char => char.bosses.includes(bossName))
    );
}

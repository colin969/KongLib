import { GameAchievement, GameStat } from "types";

class GameSidebar {
    stats: GameStat[];
    achievements: GameAchievement[];
    elemId: string;
    tab: string;
    loadState: string;
    missingOpcode: string;

    constructor(elemId: string) {
        let lastTab = localStorage.getItem('konglib-sidebar-last-tab');
        if (!lastTab) {
            lastTab = 'stats';
        }
        this.stats = [];
        this.achievements = [];
        this.elemId = elemId;
        this.tab = lastTab;
        this.loadState = 'Waiting';
    }

    updateStats(stats: GameStat[]) {
        this.stats = stats;
        this.render();
    }

    updateAchs(data: GameAchievement[]) {
        this.achievements = data;
        this.render();
    }

    setLoadState(newState: string) {
        this.loadState = newState;
        this.render();
    }

    setMissingOpcode(missingOpcode: string) {
        this.loadState = "Missing";
        this.missingOpcode = missingOpcode;
        this.render();
    }

    setTab(newTab: string) {
        this.tab = newTab;
        localStorage.setItem('konglib-sidebar-last-tab', this.tab);
        this.render();
    }

    render() {
        const root = document.getElementById(this.elemId);
        root.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'konglib-sidebar-header';

        const tabButtonStats = document.createElement('button');
        tabButtonStats.innerText = 'Stats';
        tabButtonStats.onclick = () => {
            this.setTab('stats');
        };
        header.appendChild(tabButtonStats)

        const badgesButtonStats = document.createElement('button');
        badgesButtonStats.innerText = 'Badges';
        badgesButtonStats.onclick = () => {
            this.setTab('badges');
        };
        header.appendChild(badgesButtonStats)

        const spacer = document.createElement('div');
        spacer.className = 'konglib-spacer';
        header.appendChild(spacer);

        const loadStateElem = document.createElement('div');
        if (this.loadState === "Missing") {
            loadStateElem.innerText = `${this.loadState} - ${this.missingOpcode}`;
        } else {
            loadStateElem.innerText = this.loadState;
        }
        loadStateElem.className = `konglib-sidebar-loadstate konglib-sidebar-loadstate--${this.loadState.toLowerCase()}`
        header.appendChild(loadStateElem);

        root.appendChild(header);

        const content = document.createElement('div');
        content.className = `konglib-sidebar-content konglib-sidebar-content-${this.tab}`;

        switch (this.tab) {
            case 'stats': {
                // Create a table
                const table = document.createElement('table');
                table.className = 'konglib-stats-table';

                // Header
                const header = document.createElement('tr');
                
                const addHeader = (value: any) => {
                    const elem = document.createElement('th');
                    elem.innerText = value;
                    header.appendChild(elem);
                };

                addHeader('ID');
                // addHeader('Display Name');
                addHeader('Name');
                addHeader('Type');
                addHeader('Value');

                table.appendChild(header);

                // Rows

                for (const stat of this.stats) {
                    const statsRow = document.createElement('tr');
                    statsRow.className = 'konglib-stats-row';

                    const addCell = (value: any, className: string) => {
                        const cell = document.createElement('td');
                        cell.innerText = value;
                        cell.className = className;
                        statsRow.appendChild(cell);
                    }

                    addCell(stat.id, 'konglib-stats-row--id');
                    // addCell(stat.display_name || 'N/A', 'konglib-stats-row--displayname');
                    addCell(stat.name, 'konglib-stats-row--name');
                    addCell(stat.stat_type, 'konglib-stats-row--type');
                    addCell(stat.value, 'konglib-stats-row--value');

                    table.appendChild(statsRow);
                }

                content.append(table);

                const resetButton = document.createElement('button');
                resetButton.innerText = 'Reset All Stats';
                resetButton.onclick = () => {
                    kongregate.stats.clearStats();
                };
                content.append(resetButton);
                break;
            }
            case 'badges': {
                for (const ach of this.achievements) {
                    const difficultyName = `${ach.difficulty.charAt(0).toUpperCase()}${ach.difficulty.slice(1)}`;
                    const achRow = document.createElement('div');
                    achRow.className = 'konglib-sidebar-achievement-row';

                    const achUpperRow = document.createElement('div');
                    achUpperRow.className = 'konglib-sidebar-achievement-row--upper';

                    const name = document.createElement('div');
                    name.className = 'konglib-sidebar-achievement-row--name';
                    name.innerText = ach.name;

                    const icon = document.createElement('img');
                    icon.className = 'konglib-sidebar-achievement-row--icon';
                    icon.src = ach.icon_url;
                    if (ach.unlocked) {
                        icon.className += " konglib-sidebar-achievement-row--icon-unlocked";
                    } else {
                        icon.className += " konglib-sidebar-achievement-row--icon-locked";
                        const lockIcon = document.createElement('img');
                        lockIcon.className = 'konglib-sidebar-achievement-row--icon-locked-symbol';
                        lockIcon.src = './lock.png';
                        achUpperRow.appendChild(lockIcon);
                    }

                    achUpperRow.appendChild(icon);
                    achUpperRow.appendChild(name);

                    const achPoints = document.createElement('div');
                    achPoints.className = 'konglib-sidebar-achievement-row--points';
                    achPoints.innerText = `${difficultyName} - ${ach.points} Points`;

                    const achDescription = document.createElement('div');
                    achDescription.className = 'konglib-sidebar-achievement-row--desc';
                    achDescription.innerText = ach.description;

                    achRow.append(achUpperRow);
                    achRow.append(achPoints);
                    achRow.append(achDescription);

                    for (const task of ach.accomplishment_tasks) {
                        // Render something to show task progress
                        const taskElem = document.createElement('div');
                        const stat = this.stats.find(s => s.id === task.statistic_id);
                        
                        if (stat) {
                            const taskName = document.createElement('div');
                            taskName.innerText = task.name;
                            taskElem.appendChild(taskName);

                            if (task.quota === 1) { // Binary unlock if quota is 1
                                taskElem.innerText = `${stat.value > 0 || ach.unlocked ? 'Done' : 'Not Done'}`;
                            } else {
                                const labelElem = document.createElement('div');
                                labelElem.innerText = `Current: ${stat.value} - Required: ${task.quota}`;
                                taskElem.appendChild(labelElem);

                                let value = Math.min(ach.unlocked ? task.quota : stat.value, task.quota);
                                if (task.granularity) {
                                    value = value - (value % task.granularity); // (e.g value of 97, granularity 50 = value 95)
                                }
                                const progressElem = document.createElement('progress');
                                progressElem.max = task.quota;
                                progressElem.value = value;
                                taskElem.appendChild(progressElem);
                            }
                        } else {
                            // Bad stat?
                            taskElem.innerText = `Bad Stat: ${task.statistic_id}`;
                        }
                        achRow.append(taskElem);
                    }

                    content.appendChild(achRow);
                }
                break;
            }
        }

        root.appendChild(content);
    }
}

function loadGameSidebar(elemId: string): GameSidebar {
    const sidebar = new GameSidebar(elemId);

    kongregateAPI.on('connected', () => sidebar.setLoadState("Ready"));
    kongregateAPI.connection?.on('bad_opcode', (opcode) => sidebar.setMissingOpcode(opcode));
    kongregate.stats.on('change', (stats) => sidebar.updateStats(stats));
    kongregate.stats.on('change_ach', (data) => sidebar.updateAchs(data));
    sidebar.updateStats(kongregate.stats.getStats());
    sidebar.updateAchs(kongregate.stats.getAchievements());

    return sidebar;
}

globalThis.loadGameSidebar = loadGameSidebar;
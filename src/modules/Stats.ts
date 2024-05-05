import { ApiEventManager } from "events";
import { default_stats_type_value } from "kong";
import { LOGGER } from "log";
import { GameAchievement, GameStat, GameStatMsg } from "types";

export interface IStatsModule {
    on(event: 'change', listener: (data: GameStat[]) => void): void;
    on(event: 'change_ach', listener: (data: GameAchievement[]) => void): void;

    getStats(): GameStat[];
    getAchievements(): GameAchievement[];

    loadStats(data: GameStat[]): void;
    loadAchievements(data: GameAchievement[]): void;

    setStats(data: GameStatMsg[]): void;
    setAchievements(data: GameAchievement[]): void;

    clearStats(): void;
}

export class StatsModule extends ApiEventManager implements IStatsModule {
    private stats: GameStat[] = [];
    private achievements: GameAchievement[] = [];

    getStats(): GameStat[] {
        return this.stats;
    }

    getAchievements(): GameAchievement[] {
        return this.achievements;
    }

    loadAchievements(data: GameAchievement[]) {
        this.achievements = data;
        LOGGER.debug('Loading achs');

        this.emit('change_ach', this.achievements);
    }

    loadStats(data: GameStat[]) {
        this.stats = data;

        this.emit('change', this.stats);
    }

    setStats(stats: GameStatMsg[]) {
        for (const stat of stats) {
            const statIdx = this.stats.findIndex(s => s.name === stat.name);
            if (statIdx > -1) {
                const statInfo = this.stats[statIdx];
                switch (statInfo.stat_type.toUpperCase()) {
                    case 'MAX': { // Save largest value
                        if (statInfo.value < stat.value) {
                            this.stats[statIdx].value = stat.value;
                        }
                        break;
                    }
                    case 'MIN': { // Save smallest value
                        if (statInfo.value > stat.value) {
                            this.stats[statIdx].value = stat.value;
                        }
                        break;
                    }
                    case 'ADD': { // Add to existing value
                        this.stats[statIdx].value += stat.value;
                        break;
                    }
                    case 'REPLACE': { // Replace existing value
                        this.stats[statIdx].value = stat.value;
                        break;
                    }
                    default: {
                        console.error("Invalid stat type - " + statInfo.stat_type);
                    }
                }
            }
        }

        // Check for achievement state changes

        this.doAchievementUnlocks();
        this.emit('change', this.stats);
        kongregate.localSaveData();
    }

    setAchievements(data: GameAchievement[]): void {
        for (const ach of data) {
            const achIdx = this.achievements.findIndex(s => s.id === ach.id);
            if (achIdx > -1) {
                this.achievements[achIdx].unlocked = ach.unlocked;
            }
        }

        this.emit('change_ach', this.achievements);
        kongregate.localSaveData();
    }

    doAchievementUnlocks(): void {
        let triggerUpdate = false;
        for (const ach of this.achievements.filter(a => !a.unlocked)) {
            let willUnlock = true;
            // Check against the unlock conditions
            for (const task of ach.accomplishment_tasks) {
                // Find matching stat
                const stat = this.stats.find(s => s.id === task.statistic_id);
                if (stat) {
                    // Check if condition met
                    const quotaMet = stat.stat_type === 'MIN' ? stat.value <= task.quota : stat.value >= task.quota;
                    if (quotaMet) {
                        if (task.operator === 'OR') {
                            // Only required one to match, unlock
                            ach.unlocked = true;
                            triggerUpdate = true;
                            break;
                        }
                        // If AND, then let the rest of the conditions verify
                    } else {
                        willUnlock = false;
                    }
                } else {
                    willUnlock = false;
                }
            }

            if (willUnlock) {
                triggerUpdate = true;
                ach.unlocked = true;
            }
        }

        if (triggerUpdate) {
            this.emit('change_ach', this.achievements);
        }
    }

    clearStats() {
        for (const stat of this.stats) {
            stat.value = default_stats_type_value(stat.stat_type);
        }

        this.emit('change', this.stats);
        kongregate.localSaveData();
    }
}
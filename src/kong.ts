import { IConnectionClient } from "connection/interfaces";
import { LOGGER } from "log";
import { IServicesModule, ServicesModule } from "modules/Services";
import { IStatsModule, StatsModule } from "modules/Stats";
import { BadgeInfo, GameAchievement, GameAchievementInfo, GameStat, GameStatInfo } from "types";

type GameInfo = {
    game_id: number;
    html_dimensions: {
        game_width: number;
        game_height: number;
    }
    statistics: GameStatInfo[];
    achievements: GameAchievementInfo[];
}

type SaveData = {
    stats: GameStat[];
    achievements: GameAchievement[];
}

export interface IKongLib {
    services: IServicesModule;
    stats: IStatsModule;

    loadBadgeInfo(info: BadgeInfo[]): void;
    loadGameInfo(info: GameInfo): void;
    localLoadData(): void;
    localSaveData(): void;
}

export class KongLib implements IKongLib {
    services: IServicesModule;
    stats: IStatsModule;
    connection: IConnectionClient;
    meta: GameInfo;
    badges: BadgeInfo[];

    constructor() {
        this.services = new ServicesModule();
        this.stats = new StatsModule();
        this.badges = [];
    }
    
    loadBadgeInfo(info: BadgeInfo[]): void {
        this.badges = info;    
    }

    loadGameInfo(info: GameInfo) {
        this.meta = info;
        const loadedStats: GameStat[] = info.statistics.map(s => {
            return {
                ...s,
                stat_type: s.stat_type.toUpperCase() as any,
                value: default_stats_type_value(s.stat_type.toUpperCase() as any)
            };
        });
        const loadedAch: GameAchievement[] = info.achievements.map(ach => {
            const badgeInfo = this.badges.find(b => b.id === ach.badge_id);
            if (badgeInfo) {
                const loaded: GameAchievement = {
                    ...badgeInfo,
                    id: ach.id,
                    badge_id: badgeInfo.id,
                    unlocked: false,
                    accomplishment_tasks: ach.accomplishment_tasks.map(task => {
                        const stat = info.statistics.find(s => s.id === task.statistic_id);
                        return {
                            ...task,
                            name: stat.accomplishment_tasks.find(t => t.id === task.id).name,
                        };
                    }),
                };
                return loaded;
            } else {
                console.error('Failed to find badge info for achievmenet');
                console.error(ach);
                return null;
            }
        }).filter(a => a !== null);

        LOGGER.debug('loading game info');

        this.stats.loadAchievements(loadedAch);
        this.stats.loadStats(loadedStats);
        this.localLoadData();
    }

    getSaveDataPath() {
        return `konglib-${this.meta.game_id}-savedata`;
    }

    localLoadData(): void {
        try {
            const item = localStorage.getItem(this.getSaveDataPath());
            const data: SaveData = JSON.parse(item);
            this.stats.setAchievements(data.achievements);
            this.stats.setStats(data.stats);
        } catch {
            // ignore
        }
    }
    localSaveData(): void {
        const data: SaveData = {
            stats: this.stats.getStats(),
            achievements: this.stats.getAchievements(),
        };
        localStorage.setItem(this.getSaveDataPath(), JSON.stringify(data));
    }
}

export function default_stats_type_value(stat_type: 'MAX' | 'MIN' | 'ADD' | 'REPLACE'): number {
    if (stat_type === 'MIN') {
        return Number.MAX_SAFE_INTEGER;
    } else {
        return 0;
    }
}
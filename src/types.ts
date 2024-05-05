export type GameStatInfo = {
    name: string;
    id: number;
    stat_type: 'MAX' | 'MIN' | 'ADD' | 'REPLACE';
    description: string;
    display_name?: string;
    accomplishment_tasks: Array<{
        id: number,
        name: string,
    }>
}

export type GameStat = GameStatInfo & {
    value: number;
}

export type GameStatMsg = {
    name: string;
    value: number;
}

export type GameAchievementInfo = {
    id: number;
    name: string;
    badge_id: number;
    reward_points: number;
    accomplishment_tasks: GameAccomplishment[];
};

export type GameAchievement = BadgeInfo & {
    unlocked: boolean;
    badge_id: number;
    accomplishment_tasks: GameAccomplishment[];
}

export type GameAccomplishment = {
    id: number;
    name: string;
    statistic_id: number;
    quota: number;
    operator: 'AND' | 'OR';
    granularity?: number;
}

export type BadgeInfo = {
    id: number;
    name: string;
    icon_url: string;
    created_at: string;
    points: number;
    difficulty: string;
    description: string;
    user_count: number;
}
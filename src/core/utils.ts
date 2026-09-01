/* 公共工具函数 */

/* 秒数 → 可读时长（如 "3h 20m 5s" / "2.5 天"） */
function formatDuration(sec: number): string {
    if (sec >= 86400) {
        return Number(sec / 86400).toFixed(1) + (isZH ? " 天" : " days");
    }
    const d = new Date(Math.round(sec * 1000));
    function pad(i) {
        return ("0" + i).slice(-2);
    }
    let str = d.getUTCHours() + "h " + pad(d.getUTCMinutes()) + "m " + pad(d.getUTCSeconds()) + "s";
    return str;
}

/* 战斗相关技能（与角色等级、经验相关的 7 个技能） */
const COMBAT_SKILL_HRIDS = ["stamina", "intelligence", "attack", "melee", "defense", "ranged", "magic"];
const COMBAT_SKILL_EN_NAMES = ["Stamina", "Intelligence", "Attack", "Melee", "Defense", "Ranged", "Magic"];
const COMBAT_SKILL_ZH_NAMES = ["耐力", "智力", "攻击", "近战", "防御", "远程", "魔法"];

interface CombatSkillInfo {
    level: number;
    experience: number;
    skillHrid: string;
}

/* 从 characterSkills 数组中提取战斗技能等级信息 */
function getCombatSkillInfo(skills: any[] | null | undefined): Record<string, CombatSkillInfo> {
    const result: Record<string, CombatSkillInfo> = {};
    for (const skill of skills ?? []) {
        const match = /\/skills\/([\w]+)$/.exec(skill?.skillHrid ?? "");
        const key = match?.[1];
        if (key && COMBAT_SKILL_HRIDS.includes(key)) {
            result[key] = { level: skill.level, experience: skill.experience, skillHrid: skill.skillHrid };
        }
    }
    return result;
}

/* 把战斗技能信息转为 { skillName / skillZhName / currentLevel / currentExp } 结构 */
function buildCombatSkillLevels(skills: any[] | null | undefined): Record<string, any> {
    const skillInfo = getCombatSkillInfo(skills);
    const result: Record<string, any> = {};
    COMBAT_SKILL_HRIDS.forEach((key, index) => {
        const info = skillInfo[key];
        if (!info) {
            return;
        }
        result[key] = {
            skillName: COMBAT_SKILL_EN_NAMES[index],
            skillZhName: COMBAT_SKILL_ZH_NAMES[index],
            currentLevel: info.level,
            currentExp: info.experience,
        };
    });
    return result;
}

/* 成就阶段增益：
 * MWI 的成就阶段（Beginner/Novice/Adept/Veteran/Elite/Champion）每档提供 1 个常驻增益，
 * 增益数值在 achievementTierDetailMap 中，判定阈值游戏未给出，
 * 这里按“该 tier 内成就完成率 >= 50% 视为已解锁”处理（可校准，见常量）。
 */
const ACHIEVEMENT_TIER_UNLOCK_RATE = 0.5;

/* 当前角色已解锁的成就阶段列表（无角色数据时不判定，返回空） */
function getUnlockedAchievementTiers(): any[] {
    if (!initData_characterAchievements) {
        return [];
    }
    const tiers = Object.values(initData_achievementTierDetailMap ?? {}).sort((a, b) => a.sortIndex - b.sortIndex);
    const achievements = Object.values(initData_achievementDetailMap ?? {});
    const unlocked: any[] = [];
    for (const tier of tiers) {
        const tierAchievements = achievements.filter((a) => a.tierHrid === tier.hrid);
        const total = tierAchievements.length;
        if (!total) {
            continue;
        }
        const done = tierAchievements.filter((a) => initData_characterAchievements?.[a.hrid]?.isCompleted).length;
        if (done / total >= ACHIEVEMENT_TIER_UNLOCK_RATE) {
            unlocked.push(tier);
        }
    }
    return unlocked;
}

/* 对指定动作生效的成就阶段增益列表 [{ typeHrid, percent }] */
function getAchievementTierBuffsForAction(actionHrid: string): { typeHrid: string; percent: number }[] {
    const actionDetail = initData_actionDetailMap?.[actionHrid];
    if (!actionDetail?.type) {
        return [];
    }
    const result: { typeHrid: string; percent: number }[] = [];
    for (const tier of getUnlockedAchievementTiers()) {
        if (!tier.usableInActionTypeMap?.[actionDetail.type]) {
            continue;
        }
        const buff = tier.buff;
        const percent = (buff.ratioBoost ?? buff.flatBoost ?? 0) * 100;
        result.push({ typeHrid: buff.typeHrid, percent });
    }
    return result;
}

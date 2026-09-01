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

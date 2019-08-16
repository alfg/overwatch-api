export as namespace OverwatchAPI
export = OverwatchAPI

declare namespace OverwatchAPI {
    type PLATFORM = 'pc' | 'xbl' | 'psn'
    type REGION = 'us' | 'eu' | 'kr' | 'cn' | 'global'

    function getProfile(platform: PLATFORM, region: REGION, tag: string, callback: (err: Error, data: Profile) => void): void

    function getStats(platform: PLATFORM, region: REGION, tag: string, callback: (err: Error, data: Stats) => void): void

    interface owl {
        getLiveMatch(callback: (err: Error, data: any) => void): void

        getStandings(callback: (err: Error, data: any) => void): void

        getSchedule(callback: (err: Error, data: any) => void): void
    }

    interface Endorsement {
        value: number,
        rate: number
    }

    interface Profile {
        username: string,
        level: number,
        portrait: string,
        endorsement: {
            sportsmanship: Endorsement,
            shotcaller: Endorsement,
            teammate: Endorsement,
            level: number,
            frame: string,
            icon: string,
        },
        private: boolean,
        games: {
            quickplay: {
                won: number,
                played: undefined
            },
            competitive: {
                won: number,
                lost: number,
                draw: number,
                played: number,
                win_rate: number
            }
        },
        playtime: {
            quickplay: string,
            competitive: string
        },
        competitive: {
            tank: {
                rank: number,
                rank_img: string
            },
            damage: {
                rank: number,
                rank_img: string
            },
            support: {
                rank: number,
                rank_img: string
            }
        },
        levelFrame: string,
        star: string
    }

    interface Hero {
        hero: string,
        img: string
    }

    interface HeroPlaytime extends Hero {
        played: string,
    }

    interface HeroWins extends Hero {
        games_won: string,
    }

    interface HeroAccuracy extends Hero {
        weapon_accuracy: string,
    }

    interface HeroElimsPerLife extends Hero {
        eliminations_per_life: string,
    }

    interface HeroMultiKillBest extends Hero {
        multikill_best: string,
    }

    interface HeroObjectiveKillsAverage extends Hero {
        objective_kills_average: string,
    }

    interface HeroWinRate extends Hero {
        win_rate: string,
    }

    interface Stat {
        title: string,
        value: string
    }

    interface QuickplayCompetitiveStats {
        quickplay: Array<Stat>,
        competitive: Array<Stat>
    }

    interface Stats {
        username: string,
        level: number,
        portrait: string,
        endorsement: {
            sportsmanship: Endorsement,
            shotcaller: Endorsement,
            teammate: Endorsement,
            level: number,
            frame: string,
            icon: string,
        },
        private: boolean,
        stats: {
            top_heroes: {
                quickplay: {
                    played: Array<HeroPlaytime>,
                    games_won: Array<HeroWins>,
                    weapon_accuracy: Array<HeroAccuracy>,
                    eliminations_per_life: Array<HeroElimsPerLife>,
                    multikill_best: Array<HeroMultiKillBest>,
                    objective_kills_average: Array<HeroObjectiveKillsAverage>
                },
                competitive: {
                    played: Array<HeroPlaytime>,
                    games_won: Array<HeroWins>,
                    weapon_accuracy: Array<HeroAccuracy>,
                    eliminations_per_life: Array<HeroElimsPerLife>,
                    multikill_best: Array<HeroMultiKillBest>,
                    objective_kills_average: Array<HeroObjectiveKillsAverage>,
                    win_rate: Array<HeroWinRate>
                }
            },
            combat: QuickplayCompetitiveStats,
            match_awards: QuickplayCompetitiveStats,
            assists: QuickplayCompetitiveStats,
            average: QuickplayCompetitiveStats,
            miscellaneous: QuickplayCompetitiveStats,
            best: QuickplayCompetitiveStats,
            game: QuickplayCompetitiveStats
        }
    }
}

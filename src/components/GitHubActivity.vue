<template>
  <section class="github-activity">
    <div class="activity-card cards">
      <div v-if="activityGroups.length" class="groups">
        <article v-for="group in activityGroups" :key="group.date" class="activity-day">
          <div class="event-icon">
            <Code theme="outline" size="18" fill="#a9b1ba" />
          </div>
          <div class="event-body">
            <div class="event-top">
              <h3>
                Created {{ group.totalCommits }} commit{{ group.totalCommits === 1 ? "" : "s" }} in
                {{ group.repositories.length }}
                {{ group.repositories.length === 1 ? "repository" : "repositories" }}
              </h3>
              <span>{{ group.dateLabel }}</span>
            </div>
            <div class="repo-list">
              <div v-for="repository in group.repositories" :key="repository.repo" class="repo-row">
                <div class="repo-meta">
                  <a :href="repository.url" target="_blank" rel="noreferrer">
                    {{ repository.repo }}
                  </a>
                  <span
                    >{{ repository.commits }} commit{{ repository.commits === 1 ? "" : "s" }}</span
                  >
                </div>
                <div class="event-bar">
                  <i :style="{ width: `${repository.percentage}%` }"></i>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="empty">
        <span>{{ isLoading ? "Loading activity" : "No recent public commit activity" }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Code } from "@icon-park/vue-next";
import { siteConfig } from "@/config/site";

interface GithubEvent {
  type?: string;
  created_at: string;
  repo?: { name?: string };
  payload?: { commits?: unknown[]; ref?: string | null; size?: number };
}

interface RepositoryActivity {
  repo: string;
  url: string;
  commits: number;
  percentage: number;
}

interface ActivityGroup {
  date: string;
  dateLabel: string;
  totalCommits: number;
  repositories: RepositoryActivity[];
}

const githubUser = computed(() => siteConfig.githubUsername);

const events = ref<GithubEvent[]>([]);
const isLoading = ref(true);
const dayFormatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
const visibleActivityDays = 4;

const repoUrl = (repo: string): string => `https://github.com/${repo}`;

const getPushCommitCount = (event: GithubEvent): number => {
  const reportedCommits = event.payload?.size || event.payload?.commits?.length;
  if (reportedCommits) return reportedCommits;

  // GitHub can omit the commit list and size from public PushEvent payloads.
  return event.payload?.ref ? 1 : 0;
};

const activityGroups = computed(() => {
  const groups = new Map<string, Map<string, number>>();

  events.value.forEach((event) => {
    if (event.type !== "PushEvent") return;

    const commits = getPushCommitCount(event);
    if (!commits) return;

    const date = event.created_at.slice(0, 10);
    const repo = event.repo?.name || `${githubUser.value}/GitHub`;
    const repositories = groups.get(date) || new Map<string, number>();
    repositories.set(repo, (repositories.get(repo) || 0) + commits);
    groups.set(date, repositories);
  });

  return [...groups.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .slice(0, visibleActivityDays)
    .map(([date, repositories]): ActivityGroup => {
      const totalCommits = [...repositories.values()].reduce((total, count) => total + count, 0);
      return {
        date,
        dateLabel: dayFormatter.format(new Date(`${date}T00:00:00`)),
        totalCommits,
        repositories: [...repositories.entries()]
          .sort(([, left], [, right]) => right - left)
          .map(([repo, commits]) => ({
            repo,
            url: repoUrl(repo),
            commits,
            percentage: Math.round((commits / totalCommits) * 100),
          })),
      };
    });
});

const loadActivity = async (): Promise<void> => {
  isLoading.value = true;
  try {
    const collectedEvents: GithubEvent[] = [];

    for (let page = 1; page <= 3; page += 1) {
      const response = await fetch(
        `https://api.github.com/users/${githubUser.value}/events/public?per_page=100&page=${page}`,
      );
      if (!response.ok) break;

      const data: unknown = await response.json();
      if (!Array.isArray(data)) break;

      const pageEvents = data as GithubEvent[];
      collectedEvents.push(...pageEvents);

      const dates = new Set(
        collectedEvents
          .filter((event) => event.type === "PushEvent" && getPushCommitCount(event))
          .map((event) => event.created_at.slice(0, 10)),
      );
      if (dates.size >= visibleActivityDays || pageEvents.length < 100) break;
    }

    events.value = collectedEvents;
  } catch (error) {
    console.warn("GitHub activity load failed", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadActivity);
</script>

<style lang="scss" scoped>
.github-activity {
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;

  .activity-card {
    flex: 1 1 auto;
    min-height: 0;
    max-height: none;
    padding: 14px 16px 14px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: fade 0.5s;
  }

  .groups {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    gap: 22px;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .event-icon {
    flex: 0 0 auto;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #30363dcc;
    display: flex;
    align-items: center;
    justify-content: center;
    .i-icon {
      width: 18px;
      height: 18px;
      display: block;
    }
  }

  .activity-day {
    display: grid;
    grid-template-columns: 26px minmax(0, 1fr);
    gap: 10px;
    min-width: 0;
  }

  .event-body {
    min-width: 0;
    flex: 1 1 auto;
  }

  .event-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;

    h3 {
      min-width: 0;
      color: #f0f6fc;
      font-size: 0.9rem;
      line-height: 1.3;
      font-weight: 700;
    }

    span {
      flex: 0 0 auto;
      color: #ffffff99;
      font-size: 0.8rem;
    }
  }

  .repo-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 9px;
  }

  .repo-row {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .repo-meta {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;

    a,
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    a {
      min-width: 0;
      color: #f0f6fc;
      font-size: 0.85rem;
      line-height: 1.2;
      text-decoration: none;

      &:hover {
        color: #58a6ff;
        text-decoration: underline;
      }
    }

    span {
      flex: 0 0 auto;
      color: #ffffff99;
      font-size: 0.75rem;
    }
  }

  .event-bar {
    flex: 0 1 38%;
    min-width: 64px;
    height: 2px;
    margin: 0;
    background: #161b2280;
    overflow: hidden;

    i {
      display: block;
      height: 100%;
      background: #f0f6fc;
    }
  }

  .empty {
    min-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff99;
  }

  @media (max-width: 768px) {
    height: auto;
    flex: 0 0 auto;

    .activity-card {
      min-height: 260px;
      height: auto;
      max-height: none;
    }

    .event-top {
      align-items: flex-start;
      flex-direction: column;
      gap: 4px;
    }
  }
}
</style>

<template>
  <section class="github-activity">
    <div class="activity-card cards">
      <div v-if="activityGroups.length" class="groups">
        <div v-for="group in activityGroups" :key="group.month" class="group">
          <div class="month-row">
            <span>{{ group.month }}</span>
            <i></i>
          </div>
          <div class="timeline">
            <article v-for="item in group.items" :key="item.id" class="event">
              <div class="event-icon">
                <component :is="item.icon" theme="outline" size="18" fill="#a9b1ba" />
              </div>
              <div class="event-body">
                <div class="event-top">
                  <h3>{{ item.title }}</h3>
                  <span>{{ item.dateLabel }}</span>
                </div>
                <div class="event-meta">
                  <a :href="item.repoUrl" target="_blank" rel="noreferrer">{{ item.repo }}</a>
                  <span v-if="item.detail">{{ item.detail }}</span>
                </div>
                <div v-if="item.level" class="event-bar">
                  <i :style="{ width: `${item.level}%` }"></i>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      <div v-else class="empty">
        <span>{{ isLoading ? "Loading activity" : "No recent public activity" }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  Branch,
  Code,
  FolderCode,
  Fork,
  History,
  PullRequests,
  Star,
} from "@icon-park/vue-next";
import socialLinks from "@/assets/socialLinks.json";

const fallbackUser = import.meta.env.VITE_SITE_ANTHOR || "INP146";
const githubLink = socialLinks.find((item) => item.name?.toLowerCase() === "github");
const githubUser = computed(() => {
  const url = githubLink?.url || "";
  const match = url.match(/github\.com\/([^/?#]+)/i);
  return match?.[1] || fallbackUser;
});

const events = ref([]);
const isLoading = ref(true);
const monthFormatter = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });
const dayFormatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });

const repoUrl = (repo) => `https://github.com/${repo}`;

const describeCreateEvent = (event) => {
  const type = event.payload?.ref_type;
  if (type === "repository") return { title: "Created 1 repository", icon: FolderCode };
  if (type === "branch") return { title: "Created 1 branch", icon: Branch };
  if (type === "tag") return { title: "Created 1 tag", icon: Branch };
  return { title: "Created 1 item", icon: FolderCode };
};

const describeEvent = (event) => {
  const repo = event.repo?.name || `${githubUser.value}/GitHub`;
  const commits = event.payload?.commits?.length || 0;

  if (event.type === "PushEvent") {
    const count = commits || 1;
    return {
      title: `Created ${count} commit${count > 1 ? "s" : ""} in 1 repository`,
      detail: `${count} commit${count > 1 ? "s" : ""}`,
      icon: Code,
      level: Math.min(100, Math.max(32, count * 28)),
      repo,
    };
  }

  if (event.type === "CreateEvent") {
    return {
      ...describeCreateEvent(event),
      detail: "",
      repo,
    };
  }

  if (event.type === "WatchEvent") {
    return {
      title: "Starred 1 repository",
      detail: "",
      icon: Star,
      repo,
    };
  }

  if (event.type === "ForkEvent") {
    return {
      title: "Forked 1 repository",
      detail: "",
      icon: Fork,
      repo,
    };
  }

  if (event.type === "PullRequestEvent") {
    return {
      title: `${event.payload?.action || "Updated"} 1 pull request`,
      detail: "",
      icon: PullRequests,
      repo,
    };
  }

  return {
    title: event.type?.replace("Event", "") || "GitHub activity",
    detail: "",
    icon: History,
    repo,
  };
};

const timelineItems = computed(() =>
  events.value.slice(0, 3).map((event) => {
    const date = new Date(event.created_at);
    const description = describeEvent(event);
    return {
      id: event.id,
      ...description,
      repoUrl: repoUrl(description.repo),
      month: monthFormatter.format(date),
      dateLabel: dayFormatter.format(date),
    };
  }),
);

const activityGroups = computed(() => {
  const groups = [];
  timelineItems.value.forEach((item) => {
    const group = groups.find((entry) => entry.month === item.month);
    if (group) {
      group.items.push(item);
    } else {
      groups.push({ month: item.month, items: [item] });
    }
  });
  return groups;
});

const loadActivity = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(`https://api.github.com/users/${githubUser.value}/events/public?per_page=12`);
    if (response.ok) {
      events.value = await response.json();
    }
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
    padding: 14px 16px;
    overflow: hidden;
    animation: fade 0.5s;
  }

  .group {
    & + .group {
      margin-top: 12px;
    }
  }

  .month-row {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 10px;

    span {
      color: #f0f6fc;
      font-size: 1rem;
      font-weight: 700;
      white-space: nowrap;
    }

    i {
      flex: 1 1 auto;
      height: 1px;
      background: #ffffff33;
    }
  }

  .timeline {
    position: relative;
    padding-left: 28px;

    &::before {
      content: "";
      position: absolute;
      top: 2px;
      bottom: 2px;
      left: 11px;
      width: 2px;
      background: #8b949e55;
    }
  }

  .event {
    position: relative;
    display: flex;
    gap: 14px;
    padding-bottom: 10px;

    &:last-child {
      padding-bottom: 2px;
    }
  }

  .event-icon {
    position: absolute;
    top: -1px;
    left: -28px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #30363dcc;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;

    .i-icon {
      width: 18px;
      height: 18px;
      display: block;
    }
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

  .event-meta {
    margin-top: 5px;
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
      color: #58a6ff;
      font-size: 0.9rem;
      border-bottom: 1px solid #58a6ff;
    }

    span {
      flex: 0 0 auto;
      color: #ffffff99;
      font-size: 0.85rem;
      border-bottom: 1px solid #ffffff55;
    }
  }

  .event-bar {
    margin-top: 8px;
    width: 100%;
    height: 6px;
    border-radius: 6px;
    background: #161b2280;
    overflow: hidden;

    i {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: #2ea043;
    }
  }

  .empty {
    min-height: 210px;
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

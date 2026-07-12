<template>
  <section class="github-card cards" @click="openGitHub">
    <div class="github-head">
      <div>
        <p class="eyebrow">GitHub</p>
        <h2>{{ totalText }}</h2>
      </div>
      <a class="profile-link" :href="profileUrl" target="_blank" rel="noreferrer" @click.stop>
        @{{ githubUser }}
      </a>
    </div>

    <div ref="calendarWrap" class="calendar-wrap" :class="{ loading: isLoading }">
      <div class="months" :style="monthGridStyle">
        <span
          v-for="month in monthLabels"
          :key="`${month.label}-${month.column}`"
          :style="{ gridColumn: `${month.column}`, gridRow: '1' }"
        >
          {{ month.label }}
        </span>
      </div>
      <div class="calendar-body">
        <div class="weekdays">
          <span></span>
          <span>Mon</span>
          <span></span>
          <span>Wed</span>
          <span></span>
          <span>Fri</span>
          <span></span>
        </div>
        <div class="calendar-grid" :style="gridStyle">
          <span
            v-for="day in calendarDays"
            :key="day.date"
            class="day"
            :class="`level-${day.level}`"
            :title="`${day.count} contributions on ${day.date}`"
          ></span>
        </div>
      </div>
    </div>

    <div class="github-foot">
      <div class="legend">
        <span>Less</span>
        <i v-for="level in levels" :key="level" :class="`level-${level}`"></i>
        <span>More</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { mainStore } from "@/store";
import { siteConfig } from "@/config/site";
import type { GithubContribution } from "@/types";

interface CalendarDay extends GithubContribution {}

interface MonthLabel {
  label: string;
  column: number;
}

const store = mainStore();
const githubUser = computed(() => siteConfig.githubUsername);
const profileUrl = computed(() => `https://github.com/${githubUser.value}`);

const levels = [0, 1, 2, 3, 4];
const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });
const total = computed(() => store.githubContributionsTotal);
const contributions = computed(() => store.githubContributions);
const isLoading = computed(() => !store.githubLoadStatus);
const calendarWrap = ref<HTMLDivElement | null>(null);

const createEmptyYear = (): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 365);
  start.setDate(start.getDate() - start.getDay());

  for (let i = 0; i < 371; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push({
      date: date.toISOString().slice(0, 10),
      count: 0,
      level: 0,
    });
  }
  return days;
};

const calendarDays = computed(() => {
  const source = contributions.value.length ? contributions.value : createEmptyYear();
  const sorted = [...source].sort((a, b) => a.date.localeCompare(b.date));
  const firstDate = new Date(`${sorted[0].date}T00:00:00`);
  const padding = Array.from({ length: firstDate.getDay() }, (_, index) => ({
    date: `pad-${index}`,
    count: 0,
    level: 0,
  }));
  const days = [...padding, ...sorted];
  const remainder = days.length % 7;
  const tail = remainder ? 7 - remainder : 0;

  return [
    ...days,
    ...Array.from({ length: tail }, (_, index) => ({
      date: `tail-${index}`,
      count: 0,
      level: 0,
    })),
  ];
});

const weekCount = computed(() => Math.ceil(calendarDays.value.length / 7));
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${weekCount.value}, var(--day-size))`,
}));
const monthGridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${weekCount.value}, var(--day-size))`,
}));

const monthLabels = computed(() => {
  const labels: MonthLabel[] = [];
  let previousMonth = "";

  for (let weekIndex = 0; weekIndex < weekCount.value; weekIndex += 1) {
    const week = calendarDays.value.slice(weekIndex * 7, weekIndex * 7 + 7);
    const firstRealDay = week.find(
      (day) => !day.date.startsWith("pad") && !day.date.startsWith("tail"),
    );
    if (!firstRealDay) continue;

    const date = new Date(`${firstRealDay.date}T00:00:00`);
    const month = monthFormatter.format(date);
    if (month !== previousMonth) {
      labels.push({
        label: month,
        column: weekIndex + 1,
      });
      previousMonth = month;
    }
  }

  return labels;
});

const totalText = computed(() => {
  if (isLoading.value && !contributions.value.length) return "Loading contributions";
  return `${total.value} contributions in the last year`;
});

const openGitHub = (): void => {
  window.open(profileUrl.value, "_blank");
};

const scrollToLatest = (): void => {
  nextTick(() => {
    if (!calendarWrap.value) return;
    calendarWrap.value.scrollLeft = calendarWrap.value.scrollWidth;
  });
};

watch([() => contributions.value.length, weekCount], scrollToLatest, {
  immediate: true,
  flush: "post",
});
</script>

<style lang="scss" scoped>
.github-card {
  --day-size: 10px;
  --day-gap: 4px;

  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  animation: fade 0.5s;
  cursor: pointer;
  overflow: hidden;

  .github-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;

    .eyebrow {
      margin-bottom: 4px;
      color: #ffffff99;
      font-size: 0.8rem;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    h2 {
      font-size: 1.2rem;
      line-height: 1.2;
      font-weight: 700;
      color: #f0f6fc;
    }

    .profile-link {
      flex: 0 0 auto;
      color: #f0f6fc;
      font-size: 0.95rem;
      line-height: 1.4;
      max-width: 42%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .calendar-wrap {
    margin-top: 12px;
    overflow-x: auto;
    overflow-y: hidden;
    transition: opacity 0.3s;

    &.loading {
      opacity: 0.65;
    }
  }

  .months {
    display: grid;
    margin-left: 34px;
    height: 18px;
    gap: var(--day-gap);
    min-width: max-content;

    span {
      color: #ffffffbf;
      font-size: 0.78rem;
      white-space: nowrap;
    }
  }

  .calendar-body {
    display: flex;
    gap: 8px;
    min-width: 0;
    align-items: flex-start;
  }

  .weekdays {
    width: 26px;
    display: grid;
    grid-template-rows: repeat(7, var(--day-size));
    gap: var(--day-gap);
    flex: 0 0 auto;

    span {
      height: 100%;
      color: #ffffffbf;
      font-size: 0.72rem;
      line-height: 1;
      display: flex;
      align-items: center;
    }
  }

  .calendar-grid {
    flex: 1 1 auto;
    display: grid;
    grid-template-rows: repeat(7, var(--day-size));
    grid-auto-flow: column;
    gap: var(--day-gap);
    min-width: max-content;
  }

  .day,
  .legend i {
    display: block;
    width: var(--day-size);
    height: var(--day-size);
    border-radius: 2px;
    background: #30363d;
  }

  .day.level-0,
  .legend .level-0 {
    background: #30363d;
  }

  .day.level-1,
  .legend .level-1 {
    background: #2d6a4f;
  }

  .day.level-2,
  .legend .level-2 {
    background: #238636;
  }

  .day.level-3,
  .legend .level-3 {
    background: #2ea043;
  }

  .day.level-4,
  .legend .level-4 {
    background: #39d353;
  }

  .github-foot {
    margin-top: 12px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    gap: 14px;
  }

  .legend {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #ffffffa6;
    font-size: 0.78rem;
    flex: 0 0 auto;

    i {
      width: 10px;
      height: 10px;
    }
  }

  @media (max-width: 768px) {
    flex: 0 0 auto;
    height: auto;
    min-height: 0;
    padding: 16px;

    .github-head {
      gap: 8px;

      h2 {
        font-size: 1.05rem;
      }

      .profile-link {
        max-width: 36%;
      }
    }

    .calendar-wrap {
      padding-bottom: 2px;
      -webkit-overflow-scrolling: touch;
    }

    .months {
      margin-left: 30px;
      gap: 3px;
      min-width: 620px;

      span {
        font-size: 0.68rem;
      }
    }

    .calendar-body {
      gap: 6px;
      min-width: 650px;
      align-items: flex-start;
    }

    .weekdays,
    .calendar-grid {
      gap: 3px;
    }

    .weekdays {
      width: 24px;
      grid-template-rows: repeat(7, 10px);

      span {
        font-size: 0.68rem;
      }
    }

    .calendar-grid {
      grid-template-rows: repeat(7, 10px);
    }

    .github-foot {
      justify-content: flex-start;
    }
  }
}
</style>

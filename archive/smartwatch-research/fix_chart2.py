import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import os
import warnings
warnings.filterwarnings('ignore')

plt.rcParams['font.family'] = 'Microsoft YaHei'
plt.rcParams['axes.unicode_minus'] = False

output_dir = 'D:/CC/zmt/charts'

colors_map = {
    'Silver': '#C0C0C0',
    'Dark Blue': '#1a3a5c',
    'Carbon Grey': '#4a4a4a',
}

# =============================================
# NEW CHART 2: Three-channel survey results (correct data)
# =============================================
fig, axes = plt.subplots(1, 3, figsize=(16, 5.5))

# Sub-chart a: Channel 1 - Color Feedback Survey (N=14)
labels_a = ['Carbon Grey\n57.1%', 'Silver\n21.4%', 'Dark Blue\n21.4%']
sizes_a = [8, 3, 3]
colors_a = [colors_map['Carbon Grey'], colors_map['Silver'], colors_map['Dark Blue']]
axes[0].pie(sizes_a, labels=labels_a, colors=colors_a, startangle=90, textprops={'fontsize': 10})
axes[0].set_title('Channel 1: Color Feedback\n(N=14)', fontsize=12, fontweight='bold')

# Sub-chart b: Channel 2 - Deep Survey (N=4, excl. no-answer)
labels_b = ['Dark Blue\n50.0%', 'Carbon Grey\n50.0%']
sizes_b = [2, 2]
colors_b = [colors_map['Dark Blue'], colors_map['Carbon Grey']]
axes[1].pie(sizes_b, labels=labels_b, colors=colors_b, startangle=90, textprops={'fontsize': 10})
axes[1].set_title('Channel 2: Deep Survey\n(N=4)', fontsize=12, fontweight='bold')

# Sub-chart c: Combined All 3 Channels (N=25 with clear preference)
labels_c = ['Carbon Grey\n52.0%', 'Dark Blue\n32.0%', 'Silver\n12.0%']
sizes_c = [13, 8, 3]
colors_c = [colors_map['Carbon Grey'], colors_map['Dark Blue'], colors_map['Silver']]
explode_c = (0.05, 0, 0)
axes[2].pie(sizes_c, labels=labels_c, colors=colors_c, startangle=90,
            explode=explode_c, textprops={'fontsize': 10})
axes[2].set_title('Combined (3 Channels)\n(N=25)', fontsize=12, fontweight='bold')

plt.suptitle('Bip Max Color Preference Survey Results', fontsize=15, fontweight='bold', y=1.02)
plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'chart2_survey_colors.png'), dpi=150, bbox_inches='tight')
plt.close()
print("Chart 2 regenerated (removed Black from old Week 1 data)")

# =============================================
# NEW CHART: Combined summary bar chart
# =============================================
fig, ax = plt.subplots(figsize=(8, 4.5))
colors_all = ['Carbon Grey', 'Dark Blue', 'Silver']
values = [13, 8, 3]
bar_colors = [colors_map[c] for c in colors_all]
bars = ax.bar(colors_all, values, color=bar_colors, edgecolor='white', linewidth=1.2)

for bar, val in zip(bars, values):
    ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.3,
            f'{val}\n({val/25*100:.0f}%)', ha='center', va='bottom', fontweight='bold', fontsize=13)

ax.set_ylabel('Number of Respondents', fontsize=12)
ax.set_title('Combined Survey Results: Most Preferred Color (N=25)', fontsize=14, fontweight='bold')
ax.set_ylim(0, 17)
ax.grid(axis='y', alpha=0.3)

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'chart8_combined_bar.png'), dpi=150, bbox_inches='tight')
plt.close()
print("Chart 8 (combined bar) created")

print("Done!")

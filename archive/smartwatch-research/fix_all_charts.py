import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import os
import warnings
warnings.filterwarnings('ignore')

plt.rcParams['font.family'] = 'Microsoft YaHei'
plt.rcParams['axes.unicode_minus'] = False

output_dir = 'D:/CC/zmt/charts'
os.makedirs(output_dir, exist_ok=True)

C = {
    'Silver': '#C0C0C0',
    'Dark Blue': '#1a3a5c',
    'Carbon Grey': '#4a4a4a',
    'Black': '#1a1a1a',
}

# ============================================================
# CHART 2: 3-channel survey summary (pie row)
# ============================================================
fig, axes = plt.subplots(1, 3, figsize=(16, 5.5))

# 2a: Channel 1 (N=14)
axes[0].pie([8,3,3], labels=['Carbon Grey\n57.1%','Silver\n21.4%','Dark Blue\n21.4%'],
            colors=[C['Carbon Grey'], C['Silver'], C['Dark Blue']],
            startangle=90, textprops={'fontsize': 10})
axes[0].set_title('Channel 1: Color Feedback\n(N=14)', fontsize=12, fontweight='bold')

# 2b: Channel 2 (N=4, excl no-answer)
axes[1].pie([2,2], labels=['Dark Blue\n50.0%','Carbon Grey\n50.0%'],
            colors=[C['Dark Blue'], C['Carbon Grey']],
            startangle=90, textprops={'fontsize': 10})
axes[1].set_title('Channel 2: Deep Survey\n(N=4 selected)', fontsize=12, fontweight='bold')

# 2c: Combined (N=25, excl "三种都喜欢")
axes[2].pie([13,8,3], labels=['Carbon Grey\n52.0%','Dark Blue\n32.0%','Silver\n12.0%'],
            colors=[C['Carbon Grey'], C['Dark Blue'], C['Silver']],
            explode=(0.05,0,0), startangle=90, textprops={'fontsize': 10})
axes[2].set_title('All 3 Channels Combined\n(N=25)', fontsize=12, fontweight='bold')

plt.suptitle('Bip Max Color Preference Survey', fontsize=15, fontweight='bold', y=1.02)
plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'chart2_survey_colors.png'), dpi=150, bbox_inches='tight')
plt.close()
print("chart2 done")

# ============================================================
# CHART 8: Combined bar chart
# ============================================================
fig, ax = plt.subplots(figsize=(7, 4.5))
colors_all = ['Carbon Grey', 'Dark Blue', 'Silver']
values = [13, 8, 3]
bar_colors = [C[c] for c in colors_all]
bars = ax.bar(colors_all, values, color=bar_colors, edgecolor='white', linewidth=1.2)
for bar, val in zip(bars, values):
    ax.text(bar.get_x()+bar.get_width()/2., bar.get_height()+0.3,
            f'{val}人\n({val/25*100:.0f}%)', ha='center', va='bottom', fontweight='bold', fontsize=13)
ax.set_ylabel('Number of Respondents', fontsize=11)
ax.set_title('Most Preferred Color (N=25)', fontsize=14, fontweight='bold')
ax.set_ylim(0, 17)
ax.grid(axis='y', alpha=0.3)
plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'chart8_combined_bar.png'), dpi=150, bbox_inches='tight')
plt.close()
print("chart8 done")

# ============================================================
# CHART 3: Gender (N=26, merged Prefer not + 未填 = Other)
# ============================================================
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5.5))

# Pie: Male 18, Female 6, Other 2
ax1.pie([18,6,2], labels=['Male\n69.2%','Female\n23.1%','Prefer not\n/ 未填\n7.7%'],
        colors=['#4a90d9','#e874a5','#999999'], startangle=90, textprops={'fontsize': 11})
ax1.set_title('Survey Gender Distribution\n(N=26)', fontsize=13, fontweight='bold')

# Stacked bar: Gender × Color
# Male 18: CG 11, DB 5, SV 0, 未选 1, All3 1  → but (未选) is Ch2#5 who chose Gold not BipMax
# Actually for the chart, let's do CG/DB/SV/Other:
# Male: CG 11, DB 5, SV 0, Other(未选+All3) 2
# Female: CG 2, DB 1, SV 3, Other 0
# Other: CG 0, DB 2, SV 0, Other 0
categories = ['Male\n(N=18)', 'Female\n(N=6)', 'Other\n(N=2)']
x = np.arange(len(categories))
width = 0.5

cg = [11, 2, 0]
db = [5, 1, 2]
sv = [0, 3, 0]
other_col = [2, 0, 0]  # 未选BipMax + 三种都喜欢

p1 = ax2.bar(x, sv, width, color=C['Silver'], label='Silver')
p2 = ax2.bar(x, db, width, bottom=sv, color=C['Dark Blue'], label='Dark Blue')
p3 = ax2.bar(x, cg, width, bottom=[a+b for a,b in zip(sv,db)], color=C['Carbon Grey'], label='Carbon Grey')
p4 = ax2.bar(x, other_col, width, bottom=[a+b+c for a,b,c in zip(sv,db,cg)], color='#aaaaaa', label='Other/All3')

for i, (s,d,c,o) in enumerate(zip(sv,db,cg,other_col)):
    if s>0: ax2.text(i, s/2, str(s), ha='center', va='center', fontweight='bold', fontsize=11)
    if d>0: ax2.text(i, s+d/2, str(d), ha='center', va='center', fontweight='bold', fontsize=11)
    if c>0: ax2.text(i, s+d+c/2, str(c), ha='center', va='center', fontweight='bold', fontsize=11)
    if o>0: ax2.text(i, s+d+c+o/2, str(o), ha='center', va='center', fontweight='bold', fontsize=11, color='#555')

ax2.set_xticks(x)
ax2.set_xticklabels(categories, fontsize=11)
ax2.set_title('Gender × Color Preference', fontsize=13, fontweight='bold')
ax2.legend(fontsize=8, loc='upper right')

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'chart3_gender.png'), dpi=150, bbox_inches='tight')
plt.close()
print("chart3 done")

# ============================================================
# CHART 4: Region × Color (N=26, includes Ch2 as 北美)
# ============================================================
fig, ax = plt.subplots(figsize=(11, 5.5))

# US 9, 北美(Ch2) 5, CA 3, UK 2, RU 2, ES 2, IT 1, JP 1, NL 1
regions_ordered = ['US\n(N=9)','CA\n(N=3)','北美* (Ch2)\n(N=5)','UK\n(N=2)','ES\n(N=2)','RU\n(N=2)','IT\n(N=1)','JP\n(N=1)','NL\n(N=1)']
x = np.arange(len(regions_ordered))

cg_r = [5, 2, 2, 2, 1, 1, 0, 0, 0]   # Carbon Grey
db_r = [2, 0, 2, 0, 1, 0, 1, 1, 1]   # Dark Blue
sv_r = [2, 1, 0, 0, 0, 0, 0, 0, 0]   # Silver
ot_r = [0, 0, 1, 0, 0, 1, 0, 0, 0]   # Other (未选/All3)

p1 = ax.barh(x, sv_r, 0.6, color=C['Silver'], label='Silver')
p2 = ax.barh(x, db_r, 0.6, left=sv_r, color=C['Dark Blue'], label='Dark Blue')
p3 = ax.barh(x, cg_r, 0.6, left=[a+b for a,b in zip(sv_r,db_r)], color=C['Carbon Grey'], label='Carbon Grey')
p4 = ax.barh(x, ot_r, 0.6, left=[a+b+c for a,b,c in zip(sv_r,db_r,cg_r)], color='#aaaaaa', label='Other/All3')

for i, (s,d,c,o) in enumerate(zip(sv_r,db_r,cg_r,ot_r)):
    if s>0: ax.text(s/2, i, str(s), ha='center', va='center', fontweight='bold', fontsize=9, color='#333')
    if d>0: ax.text(s+d/2, i, str(d), ha='center', va='center', fontweight='bold', fontsize=9)
    if c>0: ax.text(s+d+c/2, i, str(c), ha='center', va='center', fontweight='bold', fontsize=9)
    if o>0: ax.text(s+d+c+o/2, i, str(o), ha='center', va='center', fontweight='bold', fontsize=9, color='#555')

ax.set_yticks(x)
ax.set_yticklabels(regions_ordered, fontsize=10)
ax.set_xlabel('Number of Respondents', fontsize=11)
ax.set_title('Region × Color Preference (N=26, *Ch2无具体国家,来自北美)', fontsize=13, fontweight='bold')
ax.legend(fontsize=9, loc='lower right')
ax.set_xlim(0, 11)

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'chart4_region.png'), dpi=150, bbox_inches='tight')
plt.close()
print("chart4 done")

# ============================================================
# CHART 5: Activation vs Survey Comparison
# ============================================================
fig, ax = plt.subplots(figsize=(9, 5.5))
cats_comp = ['Silver', 'Dark Blue', 'Carbon Grey']
activation_pct = [75.7, 18.4, 5.9]
survey_pct = [12.0, 32.0, 52.0]

x = np.arange(len(cats_comp))
width = 0.35

bars1 = ax.bar(x-width/2, activation_pct, width, label='Activation (出货)',
               color=[C['Silver'], C['Dark Blue'], C['Carbon Grey']], edgecolor='black', linewidth=0.5)
bars2 = ax.bar(x+width/2, survey_pct, width, label='Survey Preference (调研)',
               color=[C['Silver'], C['Dark Blue'], C['Carbon Grey']], edgecolor='black', linewidth=0.5, hatch='//')

for bar, val in zip(bars1, activation_pct):
    ax.text(bar.get_x()+bar.get_width()/2., bar.get_height()+1,
            f'{val}%', ha='center', va='bottom', fontweight='bold', fontsize=12)
for bar, val in zip(bars2, survey_pct):
    ax.text(bar.get_x()+bar.get_width()/2., bar.get_height()+1,
            f'{val}%', ha='center', va='bottom', fontweight='bold', fontsize=12)

ax.set_ylabel('%', fontsize=12)
ax.set_title('Activation vs Survey Preference', fontsize=14, fontweight='bold')
ax.set_xticks(x)
ax.set_xticklabels(cats_comp, fontsize=12)
ax.legend(fontsize=11)
ax.set_ylim(0, 90)
ax.grid(axis='y', alpha=0.3)
plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'chart5_comparison.png'), dpi=150, bbox_inches='tight')
plt.close()
print("chart5 done")

# ============================================================
# CHART 6: Multi-select (from Ch2, N=5)
# ============================================================
fig, ax = plt.subplots(figsize=(8, 4))
colors_s = ['Grey', 'Black', 'Blue', 'Silver', 'Green']
vals_s = [4, 4, 3, 3, 1]
hex_s = [C.get(c, '#888888') for c in colors_s]
bars = ax.bar(colors_s, vals_s, color=hex_s, edgecolor='white')
for bar, val in zip(bars, vals_s):
    ax.text(bar.get_x()+bar.get_width()/2., bar.get_height()+0.1,
            f'{val}/5\n({val/5*100:.0f}%)', ha='center', va='bottom', fontweight='bold', fontsize=11)
ax.set_ylabel('Votes (N=5)', fontsize=11)
ax.set_title('Colors Considered When Buying (Multi-select, Ch2)', fontsize=13, fontweight='bold')
ax.set_ylim(0, 5.5)
ax.grid(axis='y', alpha=0.3)
plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'chart6_multiselect.png'), dpi=150, bbox_inches='tight')
plt.close()
print("chart6 done")

# ============================================================
# CHART 7: Regional Activation
# ============================================================
fig, ax = plt.subplots(figsize=(9, 5))
regions_act = ['APAC\n(N=8,075)', 'EMEA\n(N=3,642)', 'N. America\n(N=2,710)']
x = np.arange(len(regions_act))
w = 0.55
sv_act = [78.1, 73.1, 72.0]
db_act = [11.8, 26.3, 27.5]
cg_act = [10.1, 0.6, 0.4]

ax.bar(x, sv_act, w, color=C['Silver'], label='Silver', edgecolor='white')
ax.bar(x, db_act, w, bottom=sv_act, color=C['Dark Blue'], label='Dark Blue', edgecolor='white')
ax.bar(x, cg_act, w, bottom=[a+b for a,b in zip(sv_act,db_act)], color=C['Carbon Grey'], label='Carbon Grey', edgecolor='white')
for i,(s,d,cg) in enumerate(zip(sv_act,db_act,cg_act)):
    ax.text(i, s/2, f'{s}%', ha='center', va='center', fontweight='bold', fontsize=10, color='white')
    if d>10: ax.text(i, s+d/2, f'{d}%', ha='center', va='center', fontweight='bold', fontsize=10, color='white')
    if cg>3: ax.text(i, s+d+cg/2, f'{cg}%', ha='center', va='center', fontweight='bold', fontsize=10, color='white')
ax.set_xticks(x)
ax.set_xticklabels(regions_act, fontsize=11)
ax.set_ylabel('%', fontsize=11)
ax.set_title('Regional Activation Distribution', fontsize=14, fontweight='bold')
ax.legend(fontsize=10)
plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'chart7_regional_detail.png'), dpi=150, bbox_inches='tight')
plt.close()
print("chart7 done")

# ============================================================
# CHART 1: Activation pie + regional bar
# ============================================================
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

ax1.pie([10925, 2661, 846],
        labels=['Silver\n75.7%','Dark Blue\n18.4%','Carbon Grey\n5.9%'],
        colors=[C['Silver'], C['Dark Blue'], C['Carbon Grey']],
        explode=(0,0,0.1), startangle=90, textprops={'fontsize': 11})
ax1.set_title('Activation Color Distribution\n(N=14,432)', fontsize=14, fontweight='bold')

x_r = np.arange(len(regions_act))
ax2.bar(x_r-w/2, sv_act, w, color=C['Silver'], label='Silver', edgecolor='white')
ax2.bar(x_r+w/2, db_act, w, color=C['Dark Blue'], label='Dark Blue', edgecolor='white')
ax2.bar(x_r+w*1.5, cg_act, w, color=C['Carbon Grey'], label='Carbon Grey', edgecolor='white')
# Sorry this bar format doesn't work well, let me simplify
ax2.clear()
for i,(clr,hexc) in enumerate([('Silver',C['Silver']),('Dark Blue',C['Dark Blue']),('Carbon Grey',C['Carbon Grey'])]):
    vals = [sv_act, db_act, cg_act][i]
    bars = ax2.bar(x_r+i*w, vals, w, label=clr, color=hexc, edgecolor='white')
    for bar, val in zip(bars, vals):
        if val>3: ax2.text(bar.get_x()+bar.get_width()/2., bar.get_height()+1, f'{val}%', ha='center', va='bottom', fontsize=8)

ax2.set_ylabel('%', fontsize=11)
ax2.set_title('Regional Activation Distribution', fontsize=14, fontweight='bold')
ax2.set_xticks(x_r+w)
ax2.set_xticklabels(['APAC','EMEA','N.America'], fontsize=11)
ax2.legend(fontsize=9)
ax2.set_ylim(0, 92)
ax2.grid(axis='y', alpha=0.3)

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'chart1_activation.png'), dpi=150, bbox_inches='tight')
plt.close()
print("chart1 done")

print(f"\nAll charts saved to {output_dir}")

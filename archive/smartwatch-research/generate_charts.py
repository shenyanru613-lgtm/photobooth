import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np
import os
import warnings
warnings.filterwarnings('ignore')

# Try to find a font that supports CJK
# On Windows, try Microsoft YaHei or SimHei
font_candidates = ['Microsoft YaHei', 'SimHei', 'Arial', 'DejaVu Sans']
available_fonts = [f.name for f in fm.fontManager.ttflist]

use_font = None
for fc in font_candidates:
    if fc in available_fonts:
        use_font = fc
        break

if use_font:
    print(f"Using font: {use_font}")
    plt.rcParams['font.family'] = use_font
else:
    print("No CJK font found, using default")

plt.rcParams['axes.unicode_minus'] = False

output_dir = 'D:/CC/zmt/charts'
os.makedirs(output_dir, exist_ok=True)

# Color mapping for consistency
colors_map = {
    'Silver': '#C0C0C0',
    'Dark Blue': '#1a3a5c',
    'Carbon Grey': '#4a4a4a',
    'Black': '#1a1a1a',
    'Blue': '#2563eb',
    'Gold': '#d4a843',
    'Grey': '#6b7280',
    'Green': '#16a34a',
}

# =============================================
# CHART 1: Activation Distribution Pie Chart
# =============================================
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

# Pie chart
labels1 = ['Silver\n75.7%', 'Dark Blue\n18.4%', 'Carbon Grey\n5.9%']
sizes1 = [10925, 2661, 846]
colors1 = [colors_map['Silver'], colors_map['Dark Blue'], colors_map['Carbon Grey']]
explode1 = (0, 0, 0.1)

wedges1, texts1, autotexts1 = ax1.pie(sizes1, explode=explode1, labels=labels1,
                                       colors=colors1, autopct='',
                                       startangle=90, textprops={'fontsize': 11})
ax1.set_title('Bip Max Activation Color Distribution\n(Total: 14,432)', fontsize=14, fontweight='bold')

# Bar chart
regions_data = {
    'North\nAmerica': [1952/2710*100, 746/2710*100, 12/2710*100],
    'EMEA': [2662/3642*100, 959/3642*100, 21/3642*100],
    'APAC': [6307/8075*100, 955/8075*100, 813/8075*100],
}
x = np.arange(len(regions_data))
width = 0.25
for i, (color_name, color_hex) in enumerate([('Silver', colors_map['Silver']),
                                               ('Dark Blue', colors_map['Dark Blue']),
                                               ('Carbon Grey', colors_map['Carbon Grey'])]):
    values = [regions_data[r][i] for r in regions_data]
    bars = ax2.bar(x + i*width, values, width, label=color_name, color=color_hex, edgecolor='white', linewidth=0.5)
    for bar, val in zip(bars, values):
        if val > 3:
            ax2.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 1,
                    f'{val:.1f}%', ha='center', va='bottom', fontsize=8)

ax2.set_ylabel('Percentage (%)', fontsize=11)
ax2.set_title('Regional Activation Color Distribution', fontsize=14, fontweight='bold')
ax2.set_xticks(x + width)
ax2.set_xticklabels(regions_data.keys(), fontsize=11)
ax2.legend(fontsize=9)
ax2.set_ylim(0, 95)
ax2.grid(axis='y', alpha=0.3)

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'chart1_activation.png'), dpi=150, bbox_inches='tight')
plt.close()
print("Chart 1 saved")

# =============================================
# CHART 2: Survey Color Preference (Combined)
# =============================================
fig, axes = plt.subplots(1, 3, figsize=(16, 5.5))

# Sub-chart 2a: Color Feedback Survey (N=14)
labels2a = ['Carbon Grey\n57.1%', 'Silver\n21.4%', 'Dark Blue\n21.4%']
sizes2a = [8, 3, 3]
colors2a = [colors_map['Carbon Grey'], colors_map['Silver'], colors_map['Dark Blue']]
axes[0].pie(sizes2a, labels=labels2a, colors=colors2a, startangle=90,
            textprops={'fontsize': 10})
axes[0].set_title('Color Feedback Survey\n(N=14)', fontsize=12, fontweight='bold')

# Sub-chart 2b: Week 1 Survey (N=8)
labels2b = ['Silver\n62.5%', 'Black\n37.5%']
sizes2b = [5, 3]
colors2b = [colors_map['Silver'], colors_map['Black']]
axes[1].pie(sizes2b, labels=labels2b, colors=colors2b, startangle=90,
            textprops={'fontsize': 10})
axes[1].set_title('Week 1 Product Survey\n(N=8)', fontsize=12, fontweight='bold')

# Sub-chart 2c: Combined Survey (N=18)
labels2c = ['Carbon Grey\n55.6%', 'Dark Blue\n27.8%', 'Silver\n16.7%']
sizes2c = [10, 5, 3]
colors2c = [colors_map['Carbon Grey'], colors_map['Dark Blue'], colors_map['Silver']]
wedges, texts = axes[2].pie(sizes2c, labels=labels2c, colors=colors2c, startangle=90,
            textprops={'fontsize': 10})
axes[2].set_title('Combined Survey Results\n(N=18)', fontsize=12, fontweight='bold')

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'chart2_survey_colors.png'), dpi=150, bbox_inches='tight')
plt.close()
print("Chart 2 saved")

# =============================================
# CHART 3: Gender x Color Analysis
# =============================================
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5.5))

# Gender distribution of survey
gender_labels = ['Male', 'Female', 'Prefer\nnot to say']
gender_sizes = [13, 4, 1]
gender_colors_g = ['#4a90d9', '#e874a5', '#999999']
ax1.pie(gender_sizes, labels=gender_labels, colors=gender_colors_g, startangle=90,
        autopct='%1.1f%%', textprops={'fontsize': 11})
ax1.set_title('Survey Gender Distribution\n(N=18)', fontsize=13, fontweight='bold')

# Gender x Color stacked bar (from Color Feedback Survey which has gender data)
# Male: 7 Carbon Grey, 1 Dark Blue, 0 Silver
# Female: 1 Carbon Grey, 0 Dark Blue, 3 Silver
# Prefer not: 0 Carbon Grey, 1 Dark Blue, 0 Silver
categories = ['Male (N=8)', 'Female (N=4)', 'Prefer not\nto say (N=1)']
carbon_grey_vals = [7, 1, 0]
dark_blue_vals = [1, 0, 1]
silver_vals = [0, 3, 0]

x = np.arange(len(categories))
width = 0.5
p1 = ax2.bar(x, silver_vals, width, color=colors_map['Silver'], label='Silver')
p2 = ax2.bar(x, dark_blue_vals, width, bottom=silver_vals, color=colors_map['Dark Blue'], label='Dark Blue')
p3 = ax2.bar(x, carbon_grey_vals, width, bottom=[a+b for a,b in zip(silver_vals, dark_blue_vals)],
             color=colors_map['Carbon Grey'], label='Carbon Grey')

for i, (s, d, c) in enumerate(zip(silver_vals, dark_blue_vals, carbon_grey_vals)):
    if s > 0:
        ax2.text(i, s/2, str(s), ha='center', va='center', fontweight='bold', fontsize=11, color='white')
    if d > 0:
        ax2.text(i, s + d/2, str(d), ha='center', va='center', fontweight='bold', fontsize=11, color='white')
    if c > 0:
        ax2.text(i, s + d + c/2, str(c), ha='center', va='center', fontweight='bold', fontsize=11, color='white')

ax2.set_xticks(x)
ax2.set_xticklabels(categories, fontsize=11)
ax2.set_ylabel('Number of Respondents', fontsize=11)
ax2.set_title('Gender x Color Preference\n(Color Feedback Survey)', fontsize=13, fontweight='bold')
ax2.legend(fontsize=9)

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'chart3_gender.png'), dpi=150, bbox_inches='tight')
plt.close()
print("Chart 3 saved")

# =============================================
# CHART 4: Region x Color (Color Feedback Survey)
# =============================================
fig, ax = plt.subplots(figsize=(12, 5))

region_data = {
    'United States (8)': [5, 1, 2],
    'Canada (3)': [2, 0, 1],
    'Japan (1)': [0, 1, 0],
    'UK (1)': [1, 0, 0],
    'Netherlands (1)': [0, 1, 0],
}
regions_ordered = list(region_data.keys())
x = np.arange(len(regions_ordered))
width = 0.5

carbon_vals = [region_data[r][0] for r in regions_ordered]
darkblue_vals = [region_data[r][1] for r in regions_ordered]
silver_vals = [region_data[r][2] for r in regions_ordered]

p1 = ax.barh(x, silver_vals, width, color=colors_map['Silver'], label='Silver')
p2 = ax.barh(x, darkblue_vals, width, left=silver_vals, color=colors_map['Dark Blue'], label='Dark Blue')
p3 = ax.barh(x, carbon_vals, width, left=[a+b for a,b in zip(silver_vals, darkblue_vals)],
             color=colors_map['Carbon Grey'], label='Carbon Grey')

for i, (s, d, c) in enumerate(zip(silver_vals, darkblue_vals, carbon_vals)):
    if s > 0:
        ax.text(s/2, i, str(s), ha='center', va='center', fontweight='bold', fontsize=10)
    if d > 0:
        ax.text(s + d/2, i, str(d), ha='center', va='center', fontweight='bold', fontsize=10)
    if c > 0:
        ax.text(s + d + c/2, i, str(c), ha='center', va='center', fontweight='bold', fontsize=10)

ax.set_yticks(x)
ax.set_yticklabels(regions_ordered, fontsize=10)
ax.set_xlabel('Number of Respondents', fontsize=11)
ax.set_title('Region x Color Preference (Color Feedback Survey, N=14)', fontsize=13, fontweight='bold')
ax.legend(fontsize=9, loc='lower right')
ax.set_xlim(0, 9)

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'chart4_region.png'), dpi=150, bbox_inches='tight')
plt.close()
print("Chart 4 saved")

# =============================================
# CHART 5: Activation vs Survey Comparison
# =============================================
fig, ax = plt.subplots(figsize=(10, 6))

categories_comp = ['Silver', 'Dark Blue', 'Carbon Grey']
activation_pct = [75.7, 18.4, 5.9]
survey_pct = [16.7, 27.8, 55.6]

x = np.arange(len(categories_comp))
width = 0.35

bars1 = ax.bar(x - width/2, activation_pct, width, label='Current Activation\n(出货占比)',
               color=['#C0C0C0', '#1a3a5c', '#4a4a4a'], edgecolor='black', linewidth=0.5)
bars2 = ax.bar(x + width/2, survey_pct, width, label='Survey Preference\n(用户偏好)',
               color=['#C0C0C0', '#1a3a5c', '#4a4a4a'], edgecolor='black', linewidth=0.5,
               hatch='//')

for bar, val in zip(bars1, activation_pct):
    ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 1,
            f'{val}%', ha='center', va='bottom', fontweight='bold', fontsize=12)
for bar, val in zip(bars2, survey_pct):
    ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 1,
            f'{val}%', ha='center', va='bottom', fontweight='bold', fontsize=12)

ax.set_ylabel('Percentage (%)', fontsize=12)
ax.set_title('Activation Distribution vs User Survey Preference', fontsize=15, fontweight='bold')
ax.set_xticks(x)
ax.set_xticklabels(categories_comp, fontsize=12)
ax.legend(fontsize=11)
ax.set_ylim(0, 90)
ax.grid(axis='y', alpha=0.3)

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'chart5_comparison.png'), dpi=150, bbox_inches='tight')
plt.close()
print("Chart 5 saved")

# =============================================
# CHART 6: Multi-select color consideration
# =============================================
fig, ax = plt.subplots(figsize=(9, 5))

colors_considered = {'Grey': 4, 'Black': 4, 'Blue': 3, 'Silver': 3, 'Green': 1}
color_hex_list = [colors_map.get(c, '#888888') for c in colors_considered.keys()]
bars = ax.bar(colors_considered.keys(), colors_considered.values(), color=color_hex_list, edgecolor='white')

for bar, val in zip(bars, colors_considered.values()):
    ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.1,
            f'{val}/5\n({val/5*100:.0f}%)', ha='center', va='bottom', fontweight='bold', fontsize=11)

ax.set_ylabel('Number of Respondents (out of 5)', fontsize=11)
ax.set_title('Colors Users Would Consider When Buying\n(Multi-select, N=5)', fontsize=13, fontweight='bold')
ax.set_ylim(0, 5.5)
ax.grid(axis='y', alpha=0.3)

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'chart6_multiselect.png'), dpi=150, bbox_inches='tight')
plt.close()
print("Chart 6 saved")

# =============================================
# CHART 7: Regional Activation Detail
# =============================================
fig, ax = plt.subplots(figsize=(10, 5.5))

regions_act = ['North America\n(2,710)', 'EMEA\n(3,642)', 'APAC\n(8,075)']
silver_reg = [72.0, 73.1, 78.1]
darkblue_reg = [27.5, 26.3, 11.8]
carbongrey_reg = [0.4, 0.6, 10.1]

x = np.arange(len(regions_act))
width = 0.55
p1 = ax.bar(x, silver_reg, width, color=colors_map['Silver'], label='Silver', edgecolor='white')
p2 = ax.bar(x, darkblue_reg, width, bottom=silver_reg, color=colors_map['Dark Blue'], label='Dark Blue', edgecolor='white')
p3 = ax.bar(x, carbongrey_reg, width, bottom=[a+b for a,b in zip(silver_reg, darkblue_reg)],
            color=colors_map['Carbon Grey'], label='Carbon Grey', edgecolor='white')

for i, (s, d, c) in enumerate(zip(silver_reg, darkblue_reg, carbongrey_reg)):
    ax.text(i, s/2, f'{s}%', ha='center', va='center', fontweight='bold', fontsize=10, color='white')
    if d > 5:
        ax.text(i, s + d/2, f'{d}%', ha='center', va='center', fontweight='bold', fontsize=10, color='white')
    if c > 3:
        ax.text(i, s + d + c/2, f'{c}%', ha='center', va='center', fontweight='bold', fontsize=10, color='white')

ax.set_xticks(x)
ax.set_xticklabels(regions_act, fontsize=11)
ax.set_ylabel('Percentage (%)', fontsize=11)
ax.set_title('Regional Activation Color Distribution', fontsize=14, fontweight='bold')
ax.legend(fontsize=10)

plt.tight_layout()
plt.savefig(os.path.join(output_dir, 'chart7_regional_detail.png'), dpi=150, bbox_inches='tight')
plt.close()
print("Chart 7 saved")

print(f"\nAll charts saved to: {output_dir}")
print("Files:", os.listdir(output_dir))

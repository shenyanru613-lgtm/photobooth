import pandas as pd
import os
import json
from collections import Counter
import warnings
warnings.filterwarnings('ignore')

base = 'd:/web download'

# =============================================
# DATA LOADING
# =============================================

# File 1: Activation Distribution
f1 = os.path.join(base, 'Amazfit_Bip_Max_%E9%A2%9C%E8%89%B2%E6%BF%80%E6%B4%BB%E5%88%86%E5%B8%83%E7%BB%9F%E8%AE%A1.xlsx')

# File 2: Color Feedback Survey
f2 = os.path.join(base, 'Bip Max问题收集与回复系统.xlsx')
df2_color = pd.read_excel(f2, sheet_name='Bip Max Color Feedback Survey')
df2_week1 = pd.read_excel(f2, sheet_name=1)

# File 3: Color Preference Form
f3 = os.path.join(base, '2026.06 Bip Max Color Preference.xlsx')
df3_form = pd.read_excel(f3, sheet_name='Form')
df3_email = pd.read_excel(f3, sheet_name='Email List')

print("=" * 70)
print("COMPREHENSIVE BIP MAX COLOR RESEARCH ANALYSIS")
print("=" * 70)

# =============================================
# PART 1: ACTIVATION DISTRIBUTION
# =============================================
print("\n" + "=" * 70)
print("PART 1: CURRENT ACTIVATION COLOR DISTRIBUTION")
print("=" * 70)

silver_act = 10925
darkblue_act = 2661
carbongrey_act = 846
total_act = 14432

print(f"\nTotal Activated Bip Max: {total_act:,}")
print(f"  Silver:      {silver_act:,} ({silver_act/total_act*100:.1f}%)")
print(f"  Dark Blue:   {darkblue_act:,} ({darkblue_act/total_act*100:.1f}%)")
print(f"  Carbon Grey: {carbongrey_act:,} ({carbongrey_act/total_act*100:.1f}%)")

print(f"\nRegional Breakdown:")
regions = {
    'North America': {'Silver': 1952, 'Dark Blue': 746, 'Carbon Grey': 12, 'Total': 2710},
    'EMEA': {'Silver': 2662, 'Dark Blue': 959, 'Carbon Grey': 21, 'Total': 3642},
    'APAC': {'Silver': 6307, 'Dark Blue': 955, 'Carbon Grey': 813, 'Total': 8075},
}
for region, data in regions.items():
    print(f"  {region} (Total: {data['Total']:,}):")
    for color in ['Silver', 'Dark Blue', 'Carbon Grey']:
        pct = data[color] / data['Total'] * 100
        print(f"    {color}: {data[color]:,} ({pct:.1f}%)")

# =============================================
# PART 2: COLOR FEEDBACK SURVEY (File 2)
# =============================================
print("\n" + "=" * 70)
print("PART 2: BIP MAX COLOR FEEDBACK SURVEY (N=14)")
print("=" * 70)

color_counts_2 = df2_color['Which Bip Max color do you like the most?'].value_counts()
print(f"\nColor Preference (N={len(df2_color)}):")
for color, count in color_counts_2.items():
    print(f"  {color}: {count} ({count/len(df2_color)*100:.1f}%)")

gender_counts = df2_color['Gender'].value_counts()
print(f"\nGender Distribution:")
for g, c in gender_counts.items():
    print(f"  {g}: {c} ({c/len(df2_color)*100:.1f}%)")

print(f"\nGender x Color Cross-tab:")
gender_color = df2_color.groupby(['Gender', 'Which Bip Max color do you like the most?']).size().unstack(fill_value=0)
print(gender_color.to_string())

# Clean region data
df2_color['Region_Cleaned'] = df2_color['Region (Country)'].apply(
    lambda x: str(x).strip() if pd.notna(x) else 'Unknown'
)
for i in range(len(df2_color)):
    if df2_color.iloc[i]['Region_Cleaned'] == 'Other':
        supplement = df2_color.iloc[i]['Region (Country)-补充内容']
        if pd.notna(supplement):
            df2_color.at[i, 'Region_Cleaned'] = str(supplement).strip().title()

region_counts = df2_color['Region_Cleaned'].value_counts()
print(f"\nRegion Distribution:")
for r, c in region_counts.items():
    print(f"  {r}: {c} ({c/len(df2_color)*100:.1f}%)")

print(f"\nRegion x Color Cross-tab:")
region_color = df2_color.groupby(['Region_Cleaned', 'Which Bip Max color do you like the most?']).size().unstack(fill_value=0)
print(region_color.to_string())

# =============================================
# PART 3: WEEK 1 SURVEY COLOR DATA
# =============================================
print("\n" + "=" * 70)
print("PART 3: WEEK 1 SURVEY - COLOR PREFERENCE (N=9)")
print("=" * 70)

color_col = None
for col in df2_week1.columns:
    if '偏好颜色' in str(col):
        color_col = col
        break

if color_col:
    week1_colors = df2_week1[color_col].dropna()
    print(f"Color preferences (N={len(week1_colors)}):")
    for val in week1_colors:
        print(f"  - {val}")

    color_map = {'银色': 'Silver', '黑色': 'Black'}
    week1_colors_mapped = week1_colors.map(lambda x: color_map.get(str(x).strip(), str(x)))
    wc_counts = week1_colors_mapped.value_counts()
    print(f"\nMapped Color Distribution:")
    for c, cnt in wc_counts.items():
        print(f"  {c}: {cnt} ({cnt/len(week1_colors)*100:.1f}%)")

# =============================================
# PART 4: 2026.06 COLOR PREFERENCE SURVEY (File 3)
# =============================================
print("\n" + "=" * 70)
print("PART 4: 2026.06 BIP MAX COLOR PREFERENCE SURVEY (N=5)")
print("=" * 70)

color_col_3 = 'Which of these watch colors would you choose if you were buying this watch?'
if color_col_3 in df3_form.columns:
    color_choices = df3_form[color_col_3].dropna()
    print(f"\nBip Max Color Choice (N={len(color_choices)}):")
    for c, cnt in color_choices.value_counts().items():
        print(f"  {c}: {cnt} ({cnt/len(color_choices)*100:.1f}%)")

today_color_col = 'If you were buying a watch today, which color would you choose?'
if today_color_col in df3_form.columns:
    today_colors = df3_form[today_color_col].dropna()
    print(f"\nToday's Color Preference (N={len(today_colors)}):")
    for c, cnt in today_colors.value_counts().items():
        print(f"  {c}: {cnt} ({cnt/len(today_colors)*100:.1f}%)")

multi_col = 'If you were buying a watch today, which color options would you consider (select all that apply)?'
if multi_col in df3_form.columns:
    all_colors_considered = []
    for val in df3_form[multi_col].dropna():
        colors = [c.strip() for c in str(val).split(',')]
        all_colors_considered.extend(colors)
    multi_counts = Counter(all_colors_considered)
    print(f"\nColor Options Considered (multi-select, N={len(df3_form)} respondents):")
    for c, cnt in multi_counts.most_common():
        print(f"  {c}: {cnt} ({cnt/len(df3_form)*100:.0f}%)")

# Demographics
if 'What is your age?' in df3_form.columns:
    ages = df3_form['What is your age?'].dropna()
    print(f"\nAge Distribution:")
    for a, cnt in ages.value_counts().items():
        print(f"  {a}: {cnt}")

if 'What is your sex?' in df3_form.columns:
    genders = df3_form['What is your sex?'].dropna()
    print(f"\nGender:")
    for g, cnt in genders.value_counts().items():
        print(f"  {g}: {cnt}")

shape_col = 'If you were buying a watch today, which face shape would you choose?'
if shape_col in df3_form.columns:
    shapes = df3_form[shape_col].dropna()
    print(f"\nShape Preference:")
    for s, cnt in shapes.value_counts().items():
        print(f"  {s}: {cnt}")

reason_col = 'Why did you choose this option?'
if reason_col in df3_form.columns:
    reasons = df3_form[reason_col].dropna()
    print(f"\nReasons for color choice:")
    for r in reasons:
        print(f"  - {r}")

# =============================================
# PART 5: COMBINED ANALYSIS
# =============================================
print("\n" + "=" * 70)
print("PART 5: COMBINED SURVEY ANALYSIS")
print("=" * 70)

# Combine color preferences from both surveys
combined_colors = []
for c in df2_color['Which Bip Max color do you like the most?'].dropna():
    combined_colors.append(str(c).strip())
for c in df3_form[color_col_3].dropna():
    combined_colors.append(str(c).strip())

print(f"\nTotal combined survey responses: {len(combined_colors)}")
cc = Counter(combined_colors)
for color, cnt in cc.most_common():
    print(f"  {color}: {cnt} ({cnt/len(combined_colors)*100:.1f}%)")

# Combined gender
print(f"\nCombined Gender Analysis:")
genders_combined = []
for g in df2_color['Gender'].dropna():
    genders_combined.append(str(g).strip())
for i, row in df3_form.iterrows():
    sex = row.get('What is your sex?')
    if pd.notna(sex):
        genders_combined.append(str(sex).strip())

gc = Counter(genders_combined)
for g, cnt in gc.most_common():
    print(f"  {g}: {cnt} ({cnt/len(genders_combined)*100:.1f}%)")

# =============================================
# PART 6: KEY INSIGHTS SUMMARY
# =============================================
print("\n" + "=" * 70)
print("PART 6: KEY INSIGHTS")
print("=" * 70)

print("""
1. ACTIVATION vs PREFERENCE MISMATCH:
   - Currently 75.7% of activations are Silver, but only 16.7% of survey
     respondents chose Silver
   - Carbon Grey is only 5.9% of activations but 55.6% of survey respondents
     prefer it
   - Dark Blue: 18.4% activation vs 27.8% survey preference

2. GENDER INSIGHTS:
   - Male users strongly prefer Carbon Grey
   - Female users are split between Silver and Carbon Grey
   - Dark Blue has moderate appeal across genders

3. REGIONAL INSIGHTS:
   - APAC has highest Carbon Grey activation (10.1%) and highest Silver share
   - North America survey respondents overwhelmingly prefer Carbon Grey
   - EMEA shows growing Dark Blue preference

4. SURVEY RESPONSE RATE:
   - 3000+ emails sent, 19 total responses across both channels
   - Response rate: ~0.6%
   - Results should be interpreted with caution due to small sample size
""")

print("\n=== ANALYSIS COMPLETE ===")

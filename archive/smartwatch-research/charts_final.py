import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import os
import warnings
warnings.filterwarnings('ignore')

plt.rcParams['font.family'] = 'Microsoft YaHei'
plt.rcParams['axes.unicode_minus'] = False
out = 'D:/CC/zmt/charts'
os.makedirs(out, exist_ok=True)

C = {'SV':'#C0C0C0','DB':'#1a3a5c','CG':'#4a4a4a','BK':'#1a1a1a'}

# ========== chart2: 3-channel survey pies ==========
fig, ax = plt.subplots(1,3,figsize=(16,5.5))
ax[0].pie([8,3,3], labels=['Carbon Grey\n57.1%','Silver\n21.4%','Dark Blue\n21.4%'],
          colors=[C['CG'],C['SV'],C['DB']], startangle=90, textprops={'fontsize':10})
ax[0].set_title('Channel 1: Color Feedback\n(N=14)',fontsize=12,fontweight='bold')
ax[1].pie([2,2], labels=['Dark Blue\n50.0%','Carbon Grey\n50.0%'],
          colors=[C['DB'],C['CG']], startangle=90, textprops={'fontsize':10})
ax[1].set_title('Channel 2: Deep Survey\n(N=4)',fontsize=12,fontweight='bold')
ax[2].pie([13,8,3], labels=['Carbon Grey\n52.0%','Dark Blue\n32.0%','Silver\n12.0%'],
          colors=[C['CG'],C['DB'],C['SV']], explode=(0.05,0,0), startangle=90, textprops={'fontsize':10})
ax[2].set_title('All 3 Channels Combined\n(N=25)',fontsize=12,fontweight='bold')
plt.suptitle('Bip Max Color Preference Survey',fontsize=15,fontweight='bold',y=1.02)
plt.tight_layout()
plt.savefig(os.path.join(out,'chart2_survey_colors.png'),dpi=150,bbox_inches='tight')
plt.close(); print("chart2")

# ========== chart8: combined bar ==========
fig,ax=plt.subplots(figsize=(7,4.5))
for i,(lbl,v,c) in enumerate([('Carbon Grey',13,C['CG']),('Dark Blue',8,C['DB']),('Silver',3,C['SV'])]):
    ax.bar(lbl,v,color=c,edgecolor='white',linewidth=1.2)
    ax.text(i,v+0.3,f'{v}人\n({v/25*100:.0f}%)',ha='center',va='bottom',fontweight='bold',fontsize=13)
ax.set_ylabel('Number of Respondents',fontsize=11)
ax.set_title('Most Preferred Color (N=25)',fontsize=14,fontweight='bold')
ax.set_ylim(0,17); ax.grid(axis='y',alpha=0.3)
plt.tight_layout()
plt.savefig(os.path.join(out,'chart8_combined_bar.png'),dpi=150,bbox_inches='tight')
plt.close(); print("chart8")

# ========== chart3: gender (N=25: M17,F6,O2) ==========
fig,(ax1,ax2)=plt.subplots(1,2,figsize=(13,5.5))
ax1.pie([17,6,2], labels=['Male\n68.0%','Female\n24.0%','Prefer not\n/ N/A\n8.0%'],
        colors=['#4a90d9','#e874a5','#999999'], startangle=90, textprops={'fontsize':11})
ax1.set_title('Survey Gender Distribution\n(N=25)',fontsize=13,fontweight='bold')
x=np.arange(3); w=0.5
sv=[0,3,0]; db=[5,1,2]; cg=[11,2,0]; ot=[1,0,0]
b1=ax2.bar(x,sv,w,color=C['SV'],label='Silver')
b2=ax2.bar(x,db,w,bottom=sv,color=C['DB'],label='Dark Blue')
b3=ax2.bar(x,cg,w,bottom=[a+b for a,b in zip(sv,db)],color=C['CG'],label='Carbon Grey')
b4=ax2.bar(x,ot,w,bottom=[a+b+c for a,b,c in zip(sv,db,cg)],color='#aaaaaa',label='Like All 3')
for i,(s,d,c,o) in enumerate(zip(sv,db,cg,ot)):
    if s: ax2.text(i,s/2,str(s),ha='center',va='center',fontweight='bold',fontsize=11)
    if d: ax2.text(i,s+d/2,str(d),ha='center',va='center',fontweight='bold',fontsize=11)
    if c: ax2.text(i,s+d+c/2,str(c),ha='center',va='center',fontweight='bold',fontsize=11)
    if o: ax2.text(i,s+d+c+o/2,str(o),ha='center',va='center',fontweight='bold',fontsize=11,color='#555')
ax2.set_xticks(x); ax2.set_xticklabels(['Male\n(N=17)','Female\n(N=6)','Other\n(N=2)'],fontsize=11)
ax2.set_title('Gender x Color Preference (N=25)',fontsize=13,fontweight='bold')
ax2.legend(fontsize=8,loc='upper right')
plt.tight_layout()
plt.savefig(os.path.join(out,'chart3_gender.png'),dpi=150,bbox_inches='tight')
plt.close(); print("chart3")

# ========== chart4: region x color (N=25) ==========
fig,ax=plt.subplots(figsize=(11,5.5))
r=['US\n(N=9)','N.Am(Ch2)\n(N=4)','CA\n(N=3)','UK\n(N=2)','RU\n(N=2)','ES\n(N=2)','IT\n(N=1)','JP\n(N=1)','NL\n(N=1)']
y=np.arange(len(r))
cg_r=[5,2,2,2,1,1,0,0,0]; db_r=[2,2,0,0,0,1,1,1,1]; sv_r=[2,0,1,0,0,0,0,0,0]; ot_r=[0,0,0,0,1,0,0,0,0]
ax.barh(y,sv_r,0.6,color=C['SV'],label='Silver')
ax.barh(y,db_r,0.6,left=sv_r,color=C['DB'],label='Dark Blue')
ax.barh(y,cg_r,0.6,left=[a+b for a,b in zip(sv_r,db_r)],color=C['CG'],label='Carbon Grey')
ax.barh(y,ot_r,0.6,left=[a+b+c for a,b,c in zip(sv_r,db_r,cg_r)],color='#aaaaaa',label='Like All 3')
for i,(s,d,c,o) in enumerate(zip(sv_r,db_r,cg_r,ot_r)):
    if s: ax.text(s/2,i,str(s),ha='center',va='center',fontweight='bold',fontsize=9,color='#333')
    if d: ax.text(s+d/2,i,str(d),ha='center',va='center',fontweight='bold',fontsize=9)
    if c: ax.text(s+d+c/2,i,str(c),ha='center',va='center',fontweight='bold',fontsize=9)
    if o: ax.text(s+d+c+o/2,i,str(o),ha='center',va='center',fontweight='bold',fontsize=9,color='#555')
ax.set_yticks(y); ax.set_yticklabels(r,fontsize=10)
ax.set_xlabel('Number of Respondents',fontsize=11)
ax.set_title('Region x Color Preference (N=25, Ch2 from North America)',fontsize=13,fontweight='bold')
ax.legend(fontsize=9,loc='lower right'); ax.set_xlim(0,11)
plt.tight_layout()
plt.savefig(os.path.join(out,'chart4_region.png'),dpi=150,bbox_inches='tight')
plt.close(); print("chart4")

# ========== chart1: activation pie + regional bar ==========
fig,(ax1,ax2)=plt.subplots(1,2,figsize=(14,6))
ax1.pie([10925,2661,846],labels=['Silver\n75.7%','Dark Blue\n18.4%','Carbon Grey\n5.9%'],
        colors=[C['SV'],C['DB'],C['CG']],explode=(0,0,0.1),startangle=90,textprops={'fontsize':11})
ax1.set_title('Activation Color Distribution\n(N=14,432)',fontsize=14,fontweight='bold')
x_r=np.arange(3)
sv_a=[78.1,73.1,72.0]; db_a=[11.8,26.3,27.5]; cg_a=[10.1,0.6,0.4]
for i,(clr,clr_c,vals) in enumerate([('Silver',C['SV'],sv_a),('Dark Blue',C['DB'],db_a),('Carbon Grey',C['CG'],cg_a)]):
    bars=ax2.bar(x_r+i*0.25,vals,0.25,label=clr,color=clr_c,edgecolor='white')
    for bar,v in zip(bars,vals):
        if v>3: ax2.text(bar.get_x()+bar.get_width()/2.,bar.get_height()+1,f'{v:.0f}%',ha='center',va='bottom',fontsize=8)
ax2.set_ylabel('%',fontsize=11)
ax2.set_title('Regional Activation Distribution',fontsize=14,fontweight='bold')
ax2.set_xticks(x_r+0.25); ax2.set_xticklabels(['APAC\n(N=8,075)','EMEA\n(N=3,642)','N.America\n(N=2,710)'],fontsize=11)
ax2.legend(fontsize=9); ax2.set_ylim(0,92); ax2.grid(axis='y',alpha=0.3)
plt.tight_layout()
plt.savefig(os.path.join(out,'chart1_activation.png'),dpi=150,bbox_inches='tight')
plt.close(); print("chart1")

# ========== chart5: activation vs survey bar ==========
fig,ax=plt.subplots(figsize=(9,5.5))
cats=['Silver','Dark Blue','Carbon Grey']; act=[75.7,18.4,5.9]; surv=[12.0,32.0,52.0]
x=np.arange(3); w=0.35
b1=ax.bar(x-w/2,act,w,label='Activation (出货)',color=[C['SV'],C['DB'],C['CG']],edgecolor='black',linewidth=0.5)
b2=ax.bar(x+w/2,surv,w,label='Survey (调研)',color=[C['SV'],C['DB'],C['CG']],edgecolor='black',linewidth=0.5,hatch='//')
for bar,v in zip(b1,act): ax.text(bar.get_x()+bar.get_width()/2.,bar.get_height()+1,f'{v}%',ha='center',va='bottom',fontweight='bold',fontsize=12)
for bar,v in zip(b2,surv): ax.text(bar.get_x()+bar.get_width()/2.,bar.get_height()+1,f'{v}%',ha='center',va='bottom',fontweight='bold',fontsize=12)
ax.set_ylabel('%',fontsize=12); ax.set_title('Activation vs Survey Preference',fontsize=14,fontweight='bold')
ax.set_xticks(x); ax.set_xticklabels(cats,fontsize=12); ax.legend(fontsize=11); ax.set_ylim(0,90); ax.grid(axis='y',alpha=0.3)
plt.tight_layout()
plt.savefig(os.path.join(out,'chart5_comparison.png'),dpi=150,bbox_inches='tight')
plt.close(); print("chart5")

# ========== chart7: regional activation detail ==========
fig,ax=plt.subplots(figsize=(9,5))
x=np.arange(3); w=0.55
ax.bar(x,sv_a,w,color=C['SV'],label='Silver',edgecolor='white')
ax.bar(x,db_a,w,bottom=sv_a,color=C['DB'],label='Dark Blue',edgecolor='white')
ax.bar(x,cg_a,w,bottom=[a+b for a,b in zip(sv_a,db_a)],color=C['CG'],label='Carbon Grey',edgecolor='white')
for i,(s,d,cg_v) in enumerate(zip(sv_a,db_a,cg_a)):
    ax.text(i,s/2,f'{s}%',ha='center',va='center',fontweight='bold',fontsize=10,color='white')
    if d>10: ax.text(i,s+d/2,f'{d}%',ha='center',va='center',fontweight='bold',fontsize=10,color='white')
    if cg_v>3: ax.text(i,s+d+cg_v/2,f'{cg_v}%',ha='center',va='center',fontweight='bold',fontsize=10,color='white')
ax.set_xticks(x); ax.set_xticklabels(['APAC\n(N=8,075)','EMEA\n(N=3,642)','N.America\n(N=2,710)'],fontsize=11)
ax.set_ylabel('%',fontsize=11); ax.set_title('Regional Activation Distribution',fontsize=14,fontweight='bold')
ax.legend(fontsize=10)
plt.tight_layout()
plt.savefig(os.path.join(out,'chart7_regional_detail.png'),dpi=150,bbox_inches='tight')
plt.close(); print("chart7")

# ========== chart6: multi-select ==========
fig,ax=plt.subplots(figsize=(8,4))
cs=['Grey','Black','Blue','Silver','Green']; vs=[4,4,3,3,1]
hx=[C.get(c,'#888888') for c in cs]
bars=ax.bar(cs,vs,color=hx,edgecolor='white')
for bar,v in zip(bars,vs):
    ax.text(bar.get_x()+bar.get_width()/2.,bar.get_height()+0.1,f'{v}/5\n({v/5*100:.0f}%)',ha='center',va='bottom',fontweight='bold',fontsize=11)
ax.set_ylabel('Votes (N=5)',fontsize=11); ax.set_title('Colors Considered When Buying (Multi-select, Ch2)',fontsize=13,fontweight='bold')
ax.set_ylim(0,5.5); ax.grid(axis='y',alpha=0.3)
plt.tight_layout()
plt.savefig(os.path.join(out,'chart6_multiselect.png'),dpi=150,bbox_inches='tight')
plt.close(); print("chart6")

print("\nAll 7 charts done!")

import { TestQuestion, CourseCategory, UniversityLevel, GraphData } from './types';

// To avoid repetition, passages that are used for multiple questions are defined here
const VERBAL_PASSAGES = {
  TEST1_P1: `Although it was discovered in the 19th century that birds were closely related to dinosaurs, the current scientific consensus is that birds were, and always have been dinosaurs themselves. Fossil evidence demonstrates similarities between birds and other feathered dinosaurs, including hollow bones, nest building and similar brooding behaviours. Although the dinosaurian lineage of birds is largely undisputed, the evolution of powered flight in birds is still debated. Two theories of flight in birds are the “ground-up” theory, and the “trees-down” theory. Ground-up theorists suggest birds evolved powered flight from ground dwelling dinosaurs, and trees-down theorists suggest birds evolved from tree dwelling, gliding dinosaurs. Further research is required to conclusively verify the process in which birds evolved powered flight.`,
  TEST1_P2: `A feral cat is a domestic cat that was raised in the wild, without having experienced significant human contact. Feral cats differ from stray cats, in that strays were previously pets which became nomadic. Unlike strays, feral cats initially show hostility towards humans, particularly upon first contact. Feral cats may become invasive to ecosystems, particularly on insular islands, resulting in a decline in biodiversity. Non-indigenous feral cats often have few natural predators, and prey on local species unaccustomed to defending against cats. Ground nesting birds, small native mammals and even amphibian species are often impacted by invasive populations of feral cats, and have led to extinctions of these species in some cases.`,
  TEST2_P1: `Work-related stress is one of the biggest causes of sick leave in the UK. If you’ve noticed you always seem to be rushing about, or miss meal breaks, take work home or don’t have enough time for relaxation, seeing your family or for exercise, then you may well find yourself under stress, especially at work. There is often no single cause of work-related stress, but it can be caused by poor working conditions, long hours, relationship problems with colleagues, or lack of job security. Stress is often the result of a combination of these factors that builds up over time. Work-related stress can result in both physical problems such as headaches, muscular tension, back or neck pain, tiredness, digestive problems and sweating; or emotional problems, such as a lower sex drive, feelings of inadequacy, irritability and lack of concentration. According to recent surveys, one in six of the UK working population said their job is very stressful, and thirty percent of men said that the demands of their job interfere with their private lives.`,
  TEST2_P2: `For many years the hunt has been on to find an effective way to treat cancerous tumours using physical rather than chemical means. That hunt may now be over with the latest breakthrough made by Dr Jennifer West at Rice University in Houston, Texas. West has done tests on animals using a non-chemical procedure known as Photothermal Ablation. She injected millions of nanoparticles, which can absorb infrared light, into the animals’ bloodstreams. These particles go straight to the tumours because, unlike healthy tissue, tumours have abnormal blood capillaries that will let them through. A few hours later an optical fibre is inserted into the tumour and a blast of infrared light is passed down the fibre, which heats the particles and effectively cooks the tumour.`,
  TEST3_P1: `An effective PR campaign requires precise, clear communication between the client and PR officer. The client should disclose detailed information to the PR officer, including the company's history, goals, and current business plan. It is especially important to disclose any potentially problematic issues. The company should be prepared to dedicate the necessary time and resources of its senior management, as well as sufficient finances, to the campaign. The perfect PR message will be consistent, with each new approach reinforcing the key objectives of the company. If new developments do arise, the PR officer should be fully briefed as soon as possible. It is essential to keep to a clear schedule, leaving adequate time available for approval of copy. Seizing opportunities when they arise is key to the success of the campaign.`,
  TEST3_P2: `The secret to success in business is entrepreneurial spirit at all levels of the company. Employees who are identified as entrepreneurs in their own right are more motivated – their own financial success becomes integrated with the company's. Those who are oriented towards personal entrepreneurship will work long hours to develop their own tried-and-tested business practices and strategies, contributing as willing partners to the achievements of the company as a whole. Orientation and value-formation training can induce this kind of thinking in new staff recruits, inculcating the notion of how quickly it is possible to achieve financial security through hard work and innovative business approaches, combined with the impression that to miss out on opportunities for such rapid economic and social advancement would be at best unwise and at worst catastrophic.`,
  TEST4_P1: `Open-source software should not be confused with freeware, or software that is available to install free of charge. While most open-source software is free, there are many other criteria – namely that the source code must be available to the general public via an open-source license, and that anyone is allowed to modify it. Any modifications made must also be distributed under the same terms as the original software. Proponents of the open-source movement believe this collaborative development methodology results in quicker improvements and software that can be easily adapted to users’ needs. Financial savings are another main benefit of open source software. Because numerous programmers are able to identify and fix problems, advocates believe open-source software is more reliable than proprietary software. The majority of commercial software protects its source code to prevent competitors from developing a competing product. By only making a compiled, ready-to-run version available, software manufacturers retain full control over their product, which they argue ensures higher levels of quality and security. End-users must purchase a license fee, and typically benefit from a warranty and technical support. Although open-source software does not charge license fees to fund its development, it does not follow that it cannot be commercially viable. Developers charge for installation, training and technical support. Alternatively, licenses for add-ons and additional software may be sold.`,
  TEST4_P2: `The Ring of Fire is an area of frequent seismic and volcanic activity that encircles the Pacific basin. Approximately 90% of the world’s earthquakes occur in this zone, including the largest ever recorded – Chile’s 1960 Valdivia earthquake. There are an estimated 452 volcanoes – 75% of the world’s total – located in this 40,000 km belt. On its Eastern side, the Ring of Fire stretches along South and Central America up to Canada and Alaska, and includes California’s well-known San Andreas fault zone. To the west of the Pacific, it extends from Russia down to Japan, the Philippines, Indonesia and New Zealand. The Ring of Fire finishes in Antarctica, which is home to Mount Erebus, the world’s southern-most active volcano. The volcanic eruptions and earthquakes that characterise the Ring of Fire can be explained by plate tectonics, a unifying geological theory first expounded in the 1960s. The Earth’s surface is comprised of tectonic plates that change size and shift over time. Earthquakes are caused when plates that are pushing against each other suddenly slip. Volcanoes occur only when two adjacent plates converge and one plate slides under the other, a process known as subduction. As it is pushed deeper into the Earth, the subducted plate encounters high temperatures and eventually molten rock rises to the surface and erupts.`,
  TEST5_P1: `Oil sands are most commonly found in Venezuela’s Oroco Basin and Alberta, Canada. Modern technology has made the extraction of crude bitumen, or unconventional oil, from these oil sands much easier. The crude oil that is extracted from traditional oil wells is a free-flowing mixture of hydrocarbons, whereas oil sands yield a highly viscous form of petroleum. Increasing world demand for oil and higher petrol prices have made the economic viability of extracting oil sands approach that of conventional oil. Oil sands have been described as one of the dirtiest sources of fuel. Compared to conventional oil, four times the amount of greenhouse gases are generated from the extraction of bitumen from oil sands. Additionally there is an impact on the local environment. Tailing ponds of toxic waste are created whenever the tar sands are washed with water. Proponents of oil sands development point to the land that has already been reclaimed following oil sands development. Also, that there will be considerably less surface impact once technology innovations have allowed oil sand reserves to be drilled rather than mined.`,
  TEST5_P2: `Chronic Fatigue Syndrome (CFS) is the widespread name for a disorder that is also called Myalgic Encephalomyelitis (ME), but many sufferers object to the name CFS on grounds that it is does not reflect the severity of the illness. While profound fatigue is one of the symptoms of this debilitating condition, there are many others, including muscle pain, headaches, and cognitive difficulties. Its nomenclature is not the only controversial aspect of CFS. Although an estimated 17 million people worldwide have CFS, its cause is unknown and a diagnostic test does not exist. Doctors must first rule out other conditions that share CFS’s symptoms. As there is no cure for CFS, treatment tends to focus on alleviating symptoms, which can range from mild to severe. Despite the World Health Organisation classifying CFS as a neurological disease, there is much disagreement within the medical community. Some scientists believe that CFS originates from a virus, others argue that it stems from a genetic predisposition, while still others believe that it is a psychiatric condition. Because of continuing scepticism about CFS, patients welcomed a 2009 study that linked CFS and a XMRV retrovirus. What at first appeared to be a major scientific breakthrough, however, was disproven by further research – and XMRV is now thought to be a lab contaminant.`,
  TEST6_P1: `Kangaroo culling is a controversial issue in Australia, where the government has implemented culls to control populations. The issue is particularly emotive because of the kangaroo’s status as a national icon, with some detractors viewing the culls as an attack on Australia’s identity. Although indigenous to Australia, kangaroos are, in some areas, threatening the grassland ecosystem. Overgrazing causes soil erosion thus threatening the survival of certain rare species of lizard. Furthermore, in overpopulated areas, food scarcity is driving kangaroos to damage wheat crops. Protesters typically oppose the cull on grounds that it is inhumane. Instead, they favour the relocation of kangaroos to suitable new habitats, or sterilizing the animals in overpopulated areas. Sterilization, however, will not have an immediate effect on the problems of limited resources and land degradation through grazing. Not only is transporting large numbers of kangaroos an expensive undertaking, critics believe it would potentially traumatize the relocated kangaroos and ultimately threaten the new habitat.`,
  TEST6_P2: `Plastics represent the fastest-growing category of waste. Worldwide consumers use 500 billion plastic shopping bags and drink 154 billion litres of bottled water annually. The majority of these bags and bottles are made from polyethylene terepthalate (PET), a plastic derived from crude oil. Because PET takes over 1,000 years to degrade and leaks dangerous chemicals into the soil, many communities have instituted recycling programmes to reduce the amount of plastic destined for landfill. However, recycling plastic is not a perfect solution. Firstly, there are many different types of plastic, and sorting them makes recycling labour-intensive. Secondly, because the quality of plastic degrades with each reuse, recycled plastic has a low value. To reduce costs most of Europe’s plastic is shipped to China for recycling processing. The downside to this is that the transportation consumes large amounts of energy and working conditions in the Chinese processing factories are poor. While recycling plastic may salve the conscience of western consumers, reducing plastic proliferation is a better solution.`,
  TEST7_P1: `The merits of single-sex education have long been debated in the United States, where demand for single-sex schools is now on the rise. Title IV, a 1972 law prohibiting sex discrimination in education, was amended in 2006, allowing for the establishment of single-sex state schools so long as a co-educational alternative is available. While critics view single-sex schools as discriminatory and inadequate preparation for adult life, advocates claim that children, and particularly girls, benefit from a single-sex education. Some American research shows that girls attending single-sex schools have higher self-esteem, participate more in class, and score higher on aptitude tests than their counterparts in co-educational schools. A 2005 study claimed that both girls and boys attending single-sex schools spent more time on homework and had less disciplinary problems. Single-sex schools subvert stereotypical course-taking patterns and results. Advocates of single-sex schooling argue that educators can teach more effectively by tailoring their tuition to reflect current research about gender-based brain development. Many experts, however, believe that research into single-sex education is inconclusive, and that so long as the education provided is gender-fair, both girls and boys can thrive in a co-educational environment.`,
  TEST7_P2: `The United States’ space programme is at a critical juncture. Between 1971 and 2011, spending on space has declined from 5% of the federal budget to 0.5%. The US government recently announced it has cancelled its Constellation human spaceflight programme, which was intended to provide transportation to the International Space Station (ISS). Instead, NASA will shift its emphasis to developing new technologies and commercializing space flight. NASA will outsource its transportation to the ISS – a move designed to dramatically reduce launch costs. Five private companies – nearly all of which are headed by an internet entrepreneur – are sharing $50 million of federal funds to develop cargo spacecraft. NASA’s new vision has not been met by enthusiasm from all quarters, with critics calling it the death knell of America’s former supremacy in space travel. Politicians whose states are losing out on jobs as a result of NASA’s cancelled programmes have been among the most vocal critics. With entrepreneurs racing to achieve human spaceflight, the next American to land on the moon could be a commercial passenger rather than a NASA astronaut.`,
  TEST8_P1: `Today, the term surreal is used to denote a curious imaginative effect. The word’s provenance can be traced back to the revolutionary surrealism movement which grew out of Dadaism in the mid-1920s. Surrealism spread quite quickly across European arts and literature, particularly in France, between the two world wars. The movement’s founder – French poet Andre Breton – was influenced heavily by Freud’s theories, as he reacted against reason and logic in order to free the imagination from the unconscious mind. Surrealist works, both visual and oral, juxtaposed seemingly unrelated everyday objects and placed these in dreamlike settings. Thus, the popularity of surrealist paintings, including Salvador Dali’s, lies in the unconventional positioning of powerful images such as leaping tigers, melting watches and metronomes. Surrealist art is widely known today, unlike the less easily accessible works of the French surrealist writers who, ignoring the literal meanings of words, focused instead on word associations and implications. That said, the literary surrealist tradition still survives in modern-day proponents of experimental writing.`,
  TEST8_P2: `Huge controversy surrounded the construction between 1994 and 2006 of what was the world’s largest hydroelectric dam, the Three Gorges Dam. Spanning China’s 1.4-mile wide Yangtze River in the Hubei province with twenty-six state-of-the-art turbines, the dam has been heralded by the Chinese state as a symbol of China’s modernisation and engineering prowess. It supports China’s economic development by supplying over ten percent of its electricity. However, over 1.3 million people were deliberately displaced as part of the Gorges flooding project that created the dam’s 660km-long reservoir. Hundreds of archaeological sites, initially above and below ground level, were lost under the reservoir’s water. Questions remain as to whether the dam – as a source of renewable energy – benefits the surrounding environment, or depletes it by causing, for example, landslides and the death of fish species in the Yangtze. Supporters argue that the Dam’s deepening of the river has made the Yangtze easier for large ships to navigate and has reduced the risk of flooding downstream. As the only other viable Chinese energy source continues to be non-renewable coal power, the hydroelectric power generated by the dam may be the lesser of two evils.`,
  TEST9_P1: `As their name suggests, Asian carp are not indigenous to the United States, yet these invasive fish have become the subject of a Supreme Court lawsuit. Introduced in the US in 1831, carp were originally intended for consumption although today they are not widely eaten. Populations have flourished in the Mississippi and Illinois Rivers since the 1970s, when it is thought that they escaped from Midwestern fish farms during heavy flooding. Carp consume only plankton, although vast amounts of it, and some species of Asian carp can grow to over one hundred pounds. Not only are the fish a hazard to recreational boaters, they also compete with native species for food and space. Environmentalists fear that carp will infiltrate the Great Lakes, via locks connecting the Mississippi to Lake Michigan, where they would damage the ecosystem. They also fear that by crowding out species such as salmon, Asian carp would also be detrimental to the Great Lakes’ sports fishing industry. The US government currently spends $80 million per annum on Asian carp control, using methods such as toxins and underwater electric barriers designed to repel carp. Evidence of carp in Lake Michigan however has led to an-ticarp activists to call for stronger measures, such as blocking off the locks on the Chicago canal. Business interests strongly oppose the closure of this major shipping lane for economic reasons, also arguing that forcing canal traffic onto the roads will cause pollution.`,
  TEST9_P2: `The most prevalent neurological condition in the developed world, migraine is characterised by severe, recurrent headaches, with additional symptoms including nausea and sensitivity to light and sound. The frequency and duration of migraine attacks are variable: attacks may occur a few times a year or several times per month, while pain may last between four hours and three days. Approximately one third of sufferers experience an aura – a perceptual disturbance occurring before the migraine’s onset. There are numerous theories on the cause of migraines. The vascular theory posits that migraines are caused by problems with blood vessels in the brain. A more widely held view is that migraines result from low levels of the neurotransmitter serotonin in the brain. Prophylactic drug treatment, which prevents the onset of migraines, has declined in recent years, because of side effects and also improvements in medications treating an actual attack. Whereas older varieties of pain medication are potentially addictive, newer drugs called triptans work by reducing pain information travelling to the brain. Treatment plans typically include avoidance of known migraine triggers, such as diet, alcohol, and stress, as overuse of medication can lead to chronic “rebound headaches.” Not only do migraines have a debilitating effect on sufferers, they are also bad for the economy, with an estimated 25 million days lost from work every year in the UK alone.`,
  TEST10_P1: `Founded in 1954, the Bilderberg Group holds an annual conference of 120 of the world’s most powerful and influential people. Participants from 18 different countries, invited by a steering committee comprised of two people, typically include financiers, industrialists, politicians, royalty and newspaper editors. Past delegates have included Tony Blair and Bill Clinton, shortly before becoming heads of state. Reporters, however, are not invited: the Bilderberg Group’s meetings are conducted in privacy, with strict confidentiality rules to foster open discussion. The Group was established to promote understanding and cooperation between the United States and Europe and to create an informal network for the global elite. No votes are taken at the conference and no policies are agreed. However, the secrecy surrounding the conferences has given rise to numerous conspiracy theories. Right-wing critics believe that the Bilderberg Group is a shadowy global government, with some conspiracy theorists holding the Group responsible for organising events including the overthrow of Margaret Thatcher, the Bosnian War and the invasion of Iraq. Left-wing activists, who call for greater transparency, accuse the Group of being an unelected capitalist cabal controlling world finance. While opponents view the Group as undemocratic, supporters argue that modern democracies depend on cooperation between banking and politics, and that organisations such as the Bilderberg Group help ensure their success.`,
  TEST10_P2: `Although today used to describe any movement to claim back territory for ethnic, linguistic, geographical or historical reasons, the term irredentism originally came from the Italian nationalist movement Italia irredenta. Meaning “unredeemed Italy”, Italian irredentism was an opinion movement rather than a formal organisation. It sought to unify ethnically Italian territories, such as Trieste, Trentina, and Istria, that were outside of Italian borders at the time of the unification of Italy in 1866. The annexation of these Italian territories from Austria provided Italy with its strongest motive for participating in World War I. The Treaty of Versailles in 1919 satisfied most of Italy’s irredentist claims, however new borders delineated by the treaty gave rise to new irredentist claims. Dividing the German Empire into separate nations created German minority populations in the new countries of Poland and Hungary. German irredentist claims to these territories, as well as to Austria, resulted in the Second World War. The Treaty of Versailles created Yugoslavia to be a Slavic homeland, but ethnic and religious differences between Bosnians, Serbs and Croats eventually led to war in the 1990s. The artificial political states created by the Treaty of Versailles in East Africa failed to take tribal boundaries into account, and thus remain subject to irredentist claims. Similarly, borders drawn up in the Near East are still contentious today.`,
};

const QUANTITATIVE_GRAPHS = {
    TEST1_Q1_Q4: {
        type: 'bar',
        title: 'Quarterly Sales of Silver Goods at T.H. Bausil\'s (£ thousands)',
        labels: ['Q1 93', 'Q2 93', 'Q3 93', 'Q4 93', 'Q1 94', 'Q2 94'],
        yAxisLabel: 'Sales (£ thousands)',
        datasets: [{ label: 'Earnings', data: [180, 240, 350, 420, 220, 280], backgroundColor: '#3B82F6' }]
    } as GraphData,
    TEST1_Q5_Q8: {
        type: 'bar',
        title: 'Number of Consumer Goods (in thousands)',
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        yAxisLabel: 'Number of Items (thousands)',
        datasets: [
          { label: 'Manufactured', data: [35, 30, 45, 50, 40], backgroundColor: '#10B981' },
          { label: 'Sold', data: [25, 35, 35, 40, 45], backgroundColor: '#F97316' },
          { label: 'Stock', data: [20, 15, 25, 35, 30], backgroundColor: '#6366F1' }
        ]
    } as GraphData,
     TEST1_Q9_Q12: {
        type: 'bar',
        title: 'Internet Use by Age Group and Gender (%)',
        labels: ['16-24', '25-44', '45-64', '65-74', '75+'],
        yAxisLabel: 'Percentage of Age Group',
        datasets: [
          { label: 'Men', data: [88, 89, 76, 42, 16], backgroundColor: '#3B82F6' },
          { label: 'Women', data: [88, 87, 72, 38, 14], backgroundColor: '#EC4899' }
        ]
    } as GraphData,
    TEST1_Q13_Q16: {
        type: 'pie',
        title: 'Company X: Annual Profit Distribution 2023 (Total: $5.2M)',
        labels: ['Research & Dev', 'Marketing', 'Salaries', 'Operations', 'Dividends'],
        datasets: [{ label: 'Profit', data: [15, 30, 25, 20, 10], backgroundColor: ['#3B82F6', '#10B981', '#F97316', '#6366F1', '#EC4899'] }]
    } as GraphData,
    TEST1_Q17_Q20: {
        type: 'line',
        title: 'Stock Price of TechCorp Inc. (Jan-Jun)',
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        yAxisLabel: 'Price ($)',
        datasets: [{ label: 'Stock Price', data: [150, 155, 170, 160, 175, 180], backgroundColor: '#10B981' }]
    } as GraphData,
    TEST2_Q1_Q5: {
        type: 'bar',
        title: 'Global Smartphone Sales by Vendor 2023 (Millions of Units)',
        labels: ['Samsung', 'Apple', 'Xiaomi', 'Oppo', 'Vivo'],
        yAxisLabel: 'Units Sold (Millions)',
        datasets: [{ label: 'Sales', data: [280, 220, 150, 110, 100], backgroundColor: '#F97316' }]
    } as GraphData,
    TEST2_Q6_Q10: {
        type: 'line',
        title: 'Average Monthly Temperature in Lagos, Nigeria (°C)',
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        yAxisLabel: 'Temperature (°C)',
        datasets: [{ label: 'Avg Temp', data: [27, 28, 29, 28, 27, 26, 25, 25, 25, 26, 27, 27], backgroundColor: '#EC4899' }]
    } as GraphData,
    TEST2_Q11_Q15: {
        type: 'pie',
        title: 'Preferred Social Media Platforms Among Students',
        labels: ['Instagram', 'TikTok', 'Twitter (X)', 'Facebook', 'Snapchat'],
        datasets: [{ label: 'Preference', data: [35, 30, 20, 10, 5], backgroundColor: ['#833AB4', '#000000', '#1DA1F2', '#1877F2', '#FFFC00'] }]
    } as GraphData,
    TEST2_Q16_Q20: {
        type: 'bar',
        title: 'Box Office Revenue of Movie Genres (in millions USD)',
        labels: ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror'],
        yAxisLabel: 'Revenue (million USD)',
        datasets: [
            { label: 'Domestic', data: [450, 300, 250, 400, 150], backgroundColor: '#3B82F6' },
            { label: 'International', data: [650, 200, 200, 550, 250], backgroundColor: '#10B981' }
        ]
    } as GraphData,
    TEST3_Q1_Q20: { // A complex graph for a full test
        type: 'bar',
        title: 'Annual Production and Export of Major Crops (in Metric Tons)',
        labels: ['2020', '2021', '2022', '2023'],
        yAxisLabel: 'Metric Tons',
        datasets: [
            { label: 'Cocoa Production', data: [800, 820, 850, 840], backgroundColor: '#A0522D' },
            { label: 'Cocoa Export', data: [750, 780, 810, 800], backgroundColor: '#D2691E' },
            { label: 'Cashew Production', data: [200, 210, 220, 230], backgroundColor: '#808000' },
            { label: 'Cashew Export', data: [180, 190, 200, 210], backgroundColor: '#BDB76B' }
        ]
    } as GraphData,
    TEST4_Q1_Q20: {
        type: 'line',
        title: 'Internet Subscribers in Nigeria (2019-2023, in millions)',
        labels: ['Q1 2019', 'Q4 2019', 'Q4 2020', 'Q4 2021', 'Q4 2022', 'Q4 2023'],
        yAxisLabel: 'Subscribers (millions)',
        datasets: [
            { label: 'Mobile (GSM)', data: [173.6, 184.7, 204.6, 195.5, 222.6, 224.7], backgroundColor: '#0000FF' },
            { label: 'Fixed/VoIP', data: [0.1, 0.15, 0.2, 0.25, 0.3, 0.35], backgroundColor: '#FF0000' }
        ]
    } as GraphData,
    TEST5_Q1_Q20: {
        type: 'pie',
        title: 'Breakdown of Nigerian Federal Government Expenditure 2023 (Total: ₦21.83 Trillion)',
        labels: ['Debt Service (30%)', 'Capital Expenditure (25%)', 'Recurrent Expenditure (40%)', 'Statutory Transfers (5%)'],
        datasets: [{ label: 'Expenditure', data: [30, 25, 40, 5], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'] }]
    } as GraphData,
    TEST6_Q1_Q20: {
        type: 'bar',
        title: 'Literacy Rate in Nigeria by Region and Gender (%)',
        labels: ['North-West', 'North-East', 'North-Central', 'South-West', 'South-East', 'South-South'],
        yAxisLabel: 'Literacy Rate (%)',
        datasets: [
            { label: 'Male', data: [45, 50, 70, 85, 90, 80], backgroundColor: '#3B82F6' },
            { label: 'Female', data: [30, 35, 60, 80, 88, 75], backgroundColor: '#EC4899' }
        ]
    } as GraphData,
    TEST7_Q1_Q20: {
        type: 'line',
        title: 'Exchange Rate: Nigerian Naira to US Dollar (Official Rate)',
        labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
        yAxisLabel: 'NGN per USD',
        datasets: [{ label: 'NGN/USD', data: [306, 307, 360, 410, 445, 750], backgroundColor: '#228B22' }]
    } as GraphData,
    TEST8_Q1_Q20: {
        type: 'bar',
        title: 'Major Sources of Electricity Generation in Nigeria (in MW)',
        labels: ['Gas-fired', 'Hydroelectric', 'Solar', 'Other'],
        yAxisLabel: 'Megawatts (MW)',
        datasets: [{ label: 'Capacity', data: [11000, 2000, 100, 50], backgroundColor: '#FFD700' }]
    } as GraphData,
    TEST9_Q1_Q20: {
        type: 'pie',
        title: 'Age Distribution of Nigerian Population (2022 Estimate)',
        labels: ['0-14 years (44%)', '15-24 years (19%)', '25-54 years (30%)', '55-64 years (4%)', '65+ years (3%)'],
        datasets: [{ label: 'Population %', data: [44, 19, 30, 4, 3], backgroundColor: ['#4682B4', '#5F9EA0', '#87CEEB', '#B0C4DE', '#ADD8E6'] }]
    } as GraphData,
    TEST10_Q1_Q20: {
        type: 'bar',
        title: 'Top 5 Agricultural Exports from Nigeria (2023, value in billion NGN)',
        labels: ['Sesame Seeds', 'Cocoa Beans', 'Cashew Nuts', 'Ginger', 'Frozen Shrimp'],
        yAxisLabel: 'Value (billion NGN)',
        datasets: [{ label: 'Export Value', data: [120, 105, 80, 45, 30], backgroundColor: '#8B4513' }]
    } as GraphData,
};

export const NIGERIAN_UNIVERSITIES = [
  "Ahmadu Bello University",
  "Bayero University Kano",
  "Covenant University",
  "Federal University of Technology, Akure",
  "Federal University of Technology, Minna",
  "Federal University of Technology, Owerri",
  "Federal University, Oye-Ekiti",
  "Ladoke Akintola University of Technology",
  "Lagos State University",
  "Michael Okpara University of Agriculture",
  "Nnamdi Azikwe University",
  "Obafemi Awolowo University",
  "University of Abuja",
  "University of Agriculture, Abeokuta",
  "University of Benin",
  "University of Calabar",
  "University of Ibadan",
  "University of Ilorin",
  "University of Jos",
  "University of Lagos",
  "University of Maiduguri",
  "University of Nigeria, Nsukka",
  "University of Port Harcourt",
  "University of Uyo"
];

export const COURSE_CATEGORIES = Object.values(CourseCategory);
export const UNIVERSITY_LEVELS = Object.values(UniversityLevel);

export const APTITUDE_TESTS: { [key: string]: { [key: string]: TestQuestion[] } } = {
  "Abstract Reasoning": {
    "Test 1": [],
    "Test 2": [],
    "Test 3": [],
    "Test 4": [],
    "Test 5": [],
    "Test 6": [],
    "Test 7": [],
    "Test 8": [],
    "Test 9": [],
    "Test 10": [],
  },
  "Verbal Reasoning": {
    "Test 1": [],
    "Test 2": [],
    "Test 3": [],
    "Test 4": [],
    "Test 5": [],
    "Test 6": [],
    "Test 7": [],
    "Test 8": [],
    "Test 9": [],
    "Test 10": [],
  },
  "Quantitative Reasoning": {
    "Test 1": [],
    "Test 2": [],
    "Test 3": [],
    "Test 4": [],
    "Test 5": [],
    "Test 6": [],
    "Test 7": [],
    "Test 8": [],
    "Test 9": [],
    "Test 10": [],
  },
};

import { TestQuestion, CourseCategory, UniversityLevel, GraphData } from './types';

// To avoid repetition, passages that are used for multiple questions are defined here
const VERBAL_PASSAGES = {
  TEST1_P1: `Although it was discovered in the 19th century that birds were closely related to dinosaurs, the current scientific consensus is that birds were, and always have been dinosaurs themselves. Fossil evidence demonstrates similarities between birds and other feathered dinosaurs, including hollow bones, nest building and similar brooding behaviours. Although the dinosaurian lineage of birds is largely undisputed, the evolution of powered flight in birds is still debated. Two theories of flight in birds are the “ground-up” theory, and the “trees-down” theory. Ground-up theorists suggest birds evolved powered flight from ground dwelling dinosaurs, and trees-down theorists suggest birds evolved from tree dwelling, gliding dinosaurs. Further research is required to conclusively verify the process in which birds evolved powered flight.`,
  TEST1_P2: `A feral cat is a domestic cat that was raised in the wild, without having experienced significant human contact. Feral cats differ from stray cats, in that strays were previously pets which became nomadic. Unlike strays, feral cats initially show hostility towards humans, particularly upon first contact. Feral cats may become invasive to ecosystems, particularly on insular islands, resulting in a decline in biodiversity. Non-indigenous feral cats often have few natural predators, and prey on local species unaccustomed to defending against cats. Ground nesting birds, small native mammals and even amphibian species are often impacted by invasive populations of feral cats, and have led to extinctions of these species in some cases.`,
  TEST1_P3: `The parable of the broken window, also known as the glazier’s fallacy, is a concept used to illustrate the fact that money spent due to destruction does not result in a benefit to society. It has been suggested that repairing broken windows may provide employment to tradespeople, which could positively impact the economy through job creation. However, had the window not been broken, the money spent repairing it could have contributed elsewhere to the economy. Similarly, if windows never broke, those tradespeople would be free to contribute towards the economy in other occupations. The glazier’s fallacy highlights the fact that destruction of property impacts economic activity in unseen or ignored ways, which are frequently overshadowed by more obvious economic effects.`,
  TEST1_P4: `The paradox of thrift, as popularised by John Keynes, highlights the fact that excessive saving during times of economic recession negatively impacts the economy. When spending is reduced due to excessive saving, aggregate demand falls, resulting in lowered economic growth. This excessive saving results in reduced economic growth, which in turn encourages further excessive saving, causing a vicious cycle. Reduced economic growth results in reductions in salary, job security and interest on savings, negatively impacting both savers and the economy. However, it could be argued that savings held in savings accounts represent loanable capital, which banks could use to stimulate the economy via lending and investment.`,
  TEST1_P5: `The Moravec’s paradox is the counter intuitive discovery by artificial intelligence researchers that advanced reasoning requires very little computational power, but basic sensory-motor skills are incredibly computationally complex. Activities considered complex by human standards, such as calculating statistics and playing chess are very easily accomplished by artificial intelligences. However, extremely basic activities, such as recognising faces or walking up a set of stairs requires vast computational resources, and can only be accomplished by the most advanced artificial intelligences. Although futurists predict a supersession of human workers by artificial intelligences, Moravec’s paradox implies that advanced professions will be usurped first, not the simple or routine occupations, as commonly featured in science fiction.`,
  TEST2_P1: `Work-related stress is one of the biggest causes of sick leave in the UK. If you’ve noticed you always seem to be rushing about, or miss meal breaks, take work home or don’t have enough time for relaxation, seeing your family or for exercise, then you may well find yourself under stress, especially at work. There is often no single cause of work-related stress, but it can be caused by poor working conditions, long hours, relationship problems with colleagues, or lack of job security. Stress is often the result of a combination of these factors that builds up over time. Work-related stress can result in both physical problems such as headaches, muscular tension, back or neck pain, tiredness, digestive problems and sweating; or emotional problems, such as a lower sex drive, feelings of inadequacy, irritability and lack of concentration. According to recent surveys, one in six of the UK working population said their job is very stressful, and thirty percent of men said that the demands of their job interfere with their private lives.`,
  TEST2_P2: `For many years the hunt has been on to find an effective way to treat cancerous tumours using physical rather than chemical means. That hunt may now be over with the latest breakthrough made by Dr Jennifer West at Rice University in Houston, Texas. West has done tests on animals using a non-chemical procedure known as Photothermal Ablation. She injected millions of nanoparticles, which can absorb infrared light, into the animals’ bloodstreams. These particles go straight to the tumours because, unlike healthy tissue, tumours have abnormal blood capillaries that will let them through. A few hours later an optical fibre is inserted into the tumour and a blast of infrared light is passed down the fibre, which heats the particles and effectively cooks the tumour.`,
  TEST2_P3: `U3b Networks (U3b being short for the underprivileged three billion who lack internet access) is a company in Jersey set up by Greg Wyler, former owner of Rwanda’s national telephone company. His company intends to provide cheap, high-speed internet access to remote areas in developing countries, which up to now has been the reserve of developed countries. Mr Wyler plans to charge $500 per megabit per month, compared with the $4,000 charged by existing companies. Mr Wyler has so far raised €40m from investors, but this seems like a risky investment, especially as billions were lost on similar projects in the past. So why are people investing in the hope of finding customers in the world’s poorest regions? The reason is that previous projects were over-ambitious and set out to provide global coverage, whereas U3b’s project is far more modest in its optimism and its services will be available only to a 100km wide corridor around the equator, which happens to cover most developing countries. It will initially use just five satellites circling 8,000km above the equator and further expansion will be determined by customer appetite.`,
  TEST2_P4: `We have all heard about bullying in schools, but bullying in the workplace is a huge problem in the UK which results in nearly 19 million days of lost output per year and costs the country 6 billion pounds annually. Workplace bullying is the abuse of a position of power by one individual over another. Otherwise known as harassment, intimidation, aggression, coercive management and by other euphemisms, bullying in the workplace can take many forms involving gender, race or age. In a nutshell, workplace bullying means behaviour that is humiliating or offensive towards some individual. This kind of bullying ranges from violence to less obvious actions like deliberately ignoring a fellow worker.`,
  TEST2_P5: `Nobody knows what life forms may exist outside our own planet. The search for extra-terrestrial life in the universe took a step nearer to fruition with the discovery in June of what are believed to be traces of water on the surface of Mars. Life on our planet requires water and its presence on Mars may point towards the existence of past life on the planet. The Phoenix Mars Lander robot landed on the plains of Mars on May 25th 2008, searching for signs that the Martian environment might once have been habitable to life. When it dug a ditch in the planet’s surface, photos revealed small patches of bright material. Four days later those patches had disappeared, causing scientists to speculate that they were water ice that had previously been buried and which vaporised when exposed to the air. Scientists insisted that if the patches had been salt, they wouldn't have disappeared and if they had been solid carbon dioxide, then they wouldn't have vaporised.`,
  TEST2_P6: `Most workers in the UK over the age of 16 are legally entitled to a minimum rate of pay, called the national minimum wage. An independent body called the Low Pay Commission (LPC) each year reviews this rate and passes their recommendation to the government, who then set and enforce the rate. With few exceptions, the minimum wage is the same for all types of work and all kinds of business. The current amount for people over 22 years of age is £6.80 per hour. The rates for younger workers are less. However, the following groups are not entitled to receive the minimum wage: workers under school leaving age, the genuinely self-employed, some apprentices, au pairs, armed service personnel and voluntary workers. Also agricultural workers have a separate minimum rate of pay set by the Agricultural Wages Board.`,
  TEST3_P1: `A common difficulty faced by business managers is when the behaviour of a team-member conflicts with established desirable practice. How does a good leader handle such an issue? One effective angle is to lead by example: instead of waiting for a problem to develop, take a proactive approach in heading it off with reference to clearly laid out guidelines. If a problematic situation does develop, controlling it can be made simpler by invoking existing values from a mission statement which has been set out in advance. A good team will always put the needs of the organisation first. Taking such an approach gives the team a sense of personal involvement which encourages them to feel part of the organisation's mission, internalising the needs of the group rather than feeling a sense of externally imposed obligation. It provides team members with a greater sense of personal control, the sense that they have contributed individually, and by choice, to the well-being of their organisation. To achieve this, a manager must have a good understanding of the way individual people communicate – a flexible approach is essential, using real-life practical examples relevant to each team-member's particular experience.`,
  TEST3_P2: `An effective PR campaign requires precise, clear communication between the client and PR officer. The client should disclose detailed information to the PR officer, including the company's history, goals, and current business plan. It is especially important to disclose any potentially problematic issues. The company should be prepared to dedicate the necessary time and resources of its senior management, as well as sufficient finances, to the campaign. The perfect PR message will be consistent, with each new approach reinforcing the key objectives of the company. If new developments do arise, the PR officer should be fully briefed as soon as possible. It is essential to keep to a clear schedule, leaving adequate time available for approval of copy. Seizing opportunities when they arise is key to the success of the campaign.`,
  TEST3_P3: `The secret to success in business is entrepreneurial spirit at all levels of the company. Employees who are identified as entrepreneurs in their own right are more motivated – their own financial success becomes integrated with the company's. Those who are oriented towards personal entrepreneurship will work long hours to develop their own tried-and-tested business practices and strategies, contributing as willing partners to the achievements of the company as a whole. Orientation and value-formation training can induce this kind of thinking in new staff recruits, inculcating the notion of how quickly it is possible to achieve financial security through hard work and innovative business approaches, combined with the impression that to miss out on opportunities for such rapid economic and social advancement would be at best unwise and at worst catastrophic.`,
  TEST3_P4: `For ambitious employees, a good relationship with their immediate boss is crucial. A bad relationship can lead to missed opportunities for promotion, and even damage professional reputations. A boss who possesses a thorough understanding of the company's future direction and ultimate goals is the person best equipped to help an employee achieve success. Communication is key. It is important to understand a boss’s personal goals and priorities within the company, as well as their individual management approach. Clarifying instructions, anticipating needs, requesting feedback, and accepting criticism gracefully all help to build a solid working relationship. On the other hand, artificial flattery or excessive deference are tactics unlikely to impress if promotion is the goal – a good employee should demonstrate the potential to be an equally effective boss.`,
  TEST3_P5: `A good salesperson should always learn something about the company, and even the individuals, behind the product he or she is selling. Confidence in a product depends in part on confidence in the integrity, competence, and commitment of those who manufacture and distribute that product. Salespeople should therefore familiarise themselves with the principal personalities behind a company, gaining an understanding of its personnel structure and the functions, duties, and experience of key individuals within the business. It is also useful to know something of the history and development of the company, as well as being aware of its present reputation, and to be familiar with the company's particular practices and policies. As well as providing a more thorough knowledge of the product, this information can help to form the basis of an effective sales pitch.`,
  TEST3_P6: `Well-regulated, ethical practices should always be an area of primary concern for any business. In an environment where multinational conglomerates predominate, owners of small businesses may feel anonymous enough to become flexible about their code of ethics. However, the increasingly inescapable attention of the media allows an unprecedented number of individuals to access news and information with greater speed than ever before – unethical practices can become a matter of public knowledge overnight, with devastating consequences. Codes of ethical practice should apply not only to clients, but to employees, who are just as able to draw inappropriate behaviour on the part of their employers to the public's attention. In today's society, businesses of any size must be able to demonstrate transparency and accountability in their dealings with employees, clients, and the public alike.`,
  TEST3_P7: `Successful and cost-effective advertising is an important issue to consider when starting up a business. A comprehensive business plan should include details of advertising strategies, a helpful starting point for which is an analysis of the advertising currently being used by competitors in the same line of business. The rise of the internet has provided a variety of new opportunities for advertising, of which an innovative business should take full advantage. A well-designed website should ideally combine a professional appearance with user-friendly functionality, and be widely promoted to draw as much traffic as possible. This not only increases the visibility of a company, but assures potential clients that the company has a forward-thinking, enterprising outlook, and is willing to embrace as well as exploit the latest technological developments.`,
  TEST4_P1: `Open-source software should not be confused with freeware, or software that is available to install free of charge. While most open-source software is free, there are many other criteria – namely that the source code must be available to the general public via an open-source license, and that anyone is allowed to modify it. Any modifications made must also be distributed under the same terms as the original software. Proponents of the open-source movement believe this collaborative development methodology results in quicker improvements and software that can be easily adapted to users’ needs. Financial savings are another main benefit of open source software. Because numerous programmers are able to identify and fix problems, advocates believe open-source software is more reliable than proprietary software. The majority of commercial software protects its source code to prevent competitors from developing a competing product. By only making a compiled, ready-to-run version available, software manufacturers retain full control over their product, which they argue ensures higher levels of quality and security. End-users must purchase a license fee, and typically benefit from a warranty and technical support. Although open-source software does not charge license fees to fund its development, it does not follow that it cannot be commercially viable. Developers charge for installation, training and technical support. Alternatively, licenses for add-ons and additional software may be sold.`,
  TEST4_P2: `The Ring of Fire is an area of frequent seismic and volcanic activity that encircles the Pacific basin. Approximately 90% of the world’s earthquakes occur in this zone, including the largest ever recorded – Chile’s 1960 Valdivia earthquake. There are an estimated 452 volcanoes – 75% of the world’s total – located in this 40,000 km belt. On its Eastern side, the Ring of Fire stretches along South and Central America up to Canada and Alaska, and includes California’s well-known San Andreas fault zone. To the west of the Pacific, it extends from Russia down to Japan, the Philippines, Indonesia and New Zealand. The Ring of Fire finishes in Antarctica, which is home to Mount Erebus, the world’s southern-most active volcano. The volcanic eruptions and earthquakes that characterise the Ring of Fire can be explained by plate tectonics, a unifying geological theory first expounded in the 1960s. The Earth’s surface is comprised of tectonic plates that change size and shift over time. Earthquakes are caused when plates that are pushing against each other suddenly slip. Volcanoes occur only when two adjacent plates converge and one plate slides under the other, a process known as subduction. As it is pushed deeper into the Earth, the subducted plate encounters high temperatures and eventually molten rock rises to the surface and erupts.`,
  TEST4_P3: `Humans have hunted whales for thousands of years, but in the 18th and 19th centuries whaling became an important industry, due to high demand for whale oil. Even after industrialisation, whaling carried on at unsustainable levels and by the mid-twentieth century whale populations had severely declined. The International Whaling Commission (IWC) was established in 1946 to ensure the conservation of whales and to oversee the development of the whaling industry. In 1986, the IWC imposed a moratorium on commercial whaling to prevent the extinction of endangered whale species. As a result of the ban, whale stocks have recovered and thus some countries advocate the lifting of restrictions. Using loopholes in the moratorium, Japan, Norway and Iceland currently engage in commercial whaling and vigorously defend the practice as part of their cultural heritage. Anti-whaling activists, however, oppose whaling on ethical grounds. They argue that whales remain vulnerable, and that whales’ intelligence gives them intrinsic value. So intense is the whaling debate that the IWC, which requires a 75% vote to overturn the ban, has reached a stalemate. Even within nations backing a return to commercial whaling the issue is divisive. Not only has demand for whale meat declined, whale-watching has become a popular tourist activity, and an end to restrictions could threaten this profitable industry.`,
  TEST4_P4: `The Great Barrier Reef extends over 2,000 km, and has been built by tiny animals called coral polyps. Some of the Great Barrier Reef’s coral “skeleton” deposits date over half a million years old. The individual coral polyps that comprise the reef grow very slowly, increasing by only 1-3 cm a year. A cultural and ecological icon, the Great Barrier Reef has been visited by Aboriginal Australians for over 40,000 years and today attracts over two million tourists annually. Unfortunately the fragility of the reef’s ecosystem is now threatened by the effects of climate change on the temperature of the water in which it sits: the Coral Sea. Over the last decade sea pollution caused by farm runoff has caused coral bleaching, thus diminishing the appearance of one of the world’s greatest sights. The ecological damage also threatens those endemic creatures that rely upon the Great Barrier Reef for food and/or shelter. Many of these are themselves endangered species. The Great Barrier Reef is in fact a system of over 3,000 reefs and islands. The northern section of the reef contains deltaic and ribbon reefs. The most common occurrences of fringing and lagoonal reefs are in the southern sections of the reef. In the middle section you are most likely to find cresentic reefs, although this type is also found in the northern reef.`,
  TEST5_P1: `Oil sands are most commonly found in Venezuela’s Oroco Basin and Alberta, Canada. Modern technology has made the extraction of crude bitumen, or unconventional oil, from these oil sands much easier. The crude oil that is extracted from traditional oil wells is a free-flowing mixture of hydrocarbons, whereas oil sands yield a highly viscous form of petroleum. Increasing world demand for oil and higher petrol prices have made the economic viability of extracting oil sands approach that of conventional oil. Oil sands have been described as one of the dirtiest sources of fuel. Compared to conventional oil, four times the amount of greenhouse gases are generated from the extraction of bitumen from oil sands. Additionally there is an impact on the local environment. Tailing ponds of toxic waste are created whenever the tar sands are washed with water. Proponents of oil sands development point to the land that has already been reclaimed following oil sands development. Also, that there will be considerably less surface impact once technology innovations have allowed oil sand reserves to be drilled rather than mined.`,
  TEST5_P2: `Chronic Fatigue Syndrome (CFS) is the widespread name for a disorder that is also called Myalgic Encephalomyelitis (ME), but many sufferers object to the name CFS on grounds that it is does not reflect the severity of the illness. While profound fatigue is one of the symptoms of this debilitating condition, there are many others, including muscle pain, headaches, and cognitive difficulties. Its nomenclature is not the only controversial aspect of CFS. Although an estimated 17 million people worldwide have CFS, its cause is unknown and a diagnostic test does not exist. Doctors must first rule out other conditions that share CFS’s symptoms. As there is no cure for CFS, treatment tends to focus on alleviating symptoms, which can range from mild to severe. Despite the World Health Organisation classifying CFS as a neurological disease, there is much disagreement within the medical community. Some scientists believe that CFS originates from a virus, others argue that it stems from a genetic predisposition, while still others believe that it is a psychiatric condition. Because of continuing scepticism about CFS, patients welcomed a 2009 study that linked CFS and a XMRV retrovirus. What at first appeared to be a major scientific breakthrough, however, was disproven by further research – and XMRV is now thought to be a lab contaminant.`,
  TEST5_P3: `There is no unifying theory to explain the experience of dreaming. Dreaming involves an altered state of consciousness that occurs during periods of REM (rapid eye movement) sleep. One of the most unusual features of this state is that most of the body’s muscles are paralysed. The most common sleeping pattern is for a period of REM sleep to be preceded by four stages of non-REM sleep, and for this to repeat itself up to five times a night. Most adults and children, if woken during REM sleep, will report that they were dreaming. Whilst the physiological stages of sleeping may be similar across adults and young children, the potential complexity of a child’s dreams develops as they age – alongside their imagination. It’s difficult to prove that a dream is taking place – only after the fact can you know that you were dreaming. There are a small number of people, however, who do know when they are experiencing what is called a “lucid” dream. The “scanning hypothesis” posits that eyes move during REM sleep in accordance with the direction of gaze of one’s dream. Research, for example with “lucid” dreamers, has shown that eyes do point towards the action that a dreamer, having a goal-orientated dream, describes.`,
  TEST5_P4: `Ergonomics is the scientific study of the interaction between people and machines. The discipline aims to design equipment and environments that best fit users’ physical and psychological needs, thus improving the efficiency, productivity and safety of a person using a device. A multi-disciplinary field, ergonomics encompasses aspects of psychology, physiology, industrial design and mechanical engineering. The field is divided into three main areas. Physical ergonomics addresses the relationship between human anatomy and physical activity, for instance designing tools that minimize or eliminate muscle strain. This area also looks at how the physical environment affects performance and health. Cognitive ergonomics studies the mental processes involved in humans’ interactions with systems, such as computer interfaces. In designing an airplane cockpit, for example, it is of vital importance that control panels take human factors into account. Organisational ergonomics focuses on optimising socio-technical systems, such as team structure and work processes. Increasingly, progressive organisations are looking for ways to improve workplace ergonomics. The benefit of this strategy is not only increased productivity but also reduced sick leave. In the United States, compensation to workers with repetitive strain injuries costs $20 billion annually.`,
  TEST6_P1: `Kangaroo culling is a controversial issue in Australia, where the government has implemented culls to control populations. The issue is particularly emotive because of the kangaroo’s status as a national icon, with some detractors viewing the culls as an attack on Australia’s identity. Although indigenous to Australia, kangaroos are, in some areas, threatening the grassland ecosystem. Overgrazing causes soil erosion thus threatening the survival of certain rare species of lizard. Furthermore, in overpopulated areas, food scarcity is driving kangaroos to damage wheat crops. Protesters typically oppose the cull on grounds that it is inhumane. Instead, they favour the relocation of kangaroos to suitable new habitats, or sterilizing the animals in overpopulated areas. Sterilization, however, will not have an immediate effect on the problems of limited resources and land degradation through grazing. Not only is transporting large numbers of kangaroos an expensive undertaking, critics believe it would potentially traumatize the relocated kangaroos and ultimately threaten the new habitat.`,
  TEST6_P2: `Plastics represent the fastest-growing category of waste. Worldwide consumers use 500 billion plastic shopping bags and drink 154 billion litres of bottled water annually. The majority of these bags and bottles are made from polyethylene terepthalate (PET), a plastic derived from crude oil. Because PET takes over 1,000 years to degrade and leaks dangerous chemicals into the soil, many communities have instituted recycling programmes to reduce the amount of plastic destined for landfill. However, recycling plastic is not a perfect solution. Firstly, there are many different types of plastic, and sorting them makes recycling labour-intensive. Secondly, because the quality of plastic degrades with each reuse, recycled plastic has a low value. To reduce costs most of Europe’s plastic is shipped to China for recycling processing. The downside to this is that the transportation consumes large amounts of energy and working conditions in the Chinese processing factories are poor. While recycling plastic may salve the conscience of western consumers, reducing plastic proliferation is a better solution.`,
  TEST7_P1: `The merits of single-sex education have long been debated in the United States, where demand for single-sex schools is now on the rise. Title IV, a 1972 law prohibiting sex discrimination in education, was amended in 2006, allowing for the establishment of single-sex state schools so long as a co-educational alternative is available. While critics view single-sex schools as discriminatory and inadequate preparation for adult life, advocates claim that children, and particularly girls, benefit from a single-sex education. Some American research shows that girls attending single-sex schools have higher self-esteem, participate more in class, and score higher on aptitude tests than their counterparts in co-educational schools. A 2005 study claimed that both girls and boys attending single-sex schools spent more time on homework and had less disciplinary problems. Single-sex schools subvert stereotypical course-taking patterns and results. Advocates of single-sex schooling argue that educators can teach more effectively by tailoring their tuition to reflect current research about gender-based brain development. Many experts, however, believe that research into single-sex education is inconclusive, and that so long as the education provided is gender-fair, both girls and boys can thrive in a co-educational environment.`,
  TEST7_P2: `The United States’ space programme is at a critical juncture. Between 1971 and 2011, spending on space has declined from 5% of the federal budget to 0.5%. The US government recently announced it has cancelled its Constellation human spaceflight programme, which was intended to provide transportation to the International Space Station (ISS). Instead, NASA will shift its emphasis to developing new technologies and commercializing space flight. NASA will outsource its transportation to the ISS – a move designed to dramatically reduce launch costs. Five private companies – nearly all of which are headed by internet entrepreneurs – are sharing $50 million of federal funds to develop cargo spacecraft. NASA’s new vision has not been met by enthusiasm from all quarters, with critics calling it the death knell of America’s former supremacy in space travel. Politicians whose states are losing out on jobs as a result of NASA’s cancelled programmes have been among the most vocal critics. With entrepreneurs racing to achieve human spaceflight, the next American to land on the moon could be a commercial passenger rather than a NASA astronaut.`,
  TEST7_P3: `Although according to the EU-funded Psychonaut Research Project it has only been available since 2008, mephedrone is now the fourth most popular recreational drug in the United Kingdom. Also known as “meow meow” and “drone”, mephedrone is a synthetic stimulant that is derived from cathinone compounds found in the khat plant of Eastern Africa. Chemically similar to amphetamines, mephedrone has the effect of euphoria and increased stimulation. Because it is sold as plant fertilizer and thus not subject to medical regulations, mephedrone is currently legal in the United Kingdom, although it has been banned in many other countries, including Sweden, Germany and Israel. Manufactured in China and sold cheaply, the drug’s legality and availability have led to its meteoric rise. While it is not illegal, it does not follow that mephedrone is safe to use – an international lack of scientific research means that its effects on health are not fully known. Following reports of addiction and the drug’s suspected involvement in several deaths; there are calls in the UK to have mephedrone classified as an illegal substance immediately. This legal decision, however, cannot be taken until a government advisory council has fully investigated any scientific evidence.`,
  TEST7_P4: `Ecotourism can be defined as responsible travel to natural areas that aims to both conserve the environment and bring economic opportunities to local people. Ecotourism provides an alternative to environmentally damaging industries such as logging and mining, while also stimulating the local economy. However, its dependency on foreign investment leads to one of the main criticisms of the industry: that the profits generated from ecotourism do not benefit the local economy and work force. Furthermore, while the ideals behind ecotourism are unobjectionable, the industry is highly susceptible to “greenwashing” – whereby a false impression of environmental friendliness is given. More radical opposition comes from those critics who believe that ecotourism is inherently flawed because travel that uses fossil fuels is damaging to the environment. Despite these voices of dissent, ecotourism has become the fastest-growing sector of the tourism industry, growing at an annual rate of twenty to thirty percent. Ironically, ecotourism’s very success may counteract its environmental goals, as high levels of visitors – even careful ones – inevitably damage the ecosystem.`,
  TEST8_P1: `Today, the term surreal is used to denote a curious imaginative effect. The word’s provenance can be traced back to the revolutionary surrealism movement which grew out of Dadaism in the mid-1920s. Surrealism spread quite quickly across European arts and literature, particularly in France, between the two world wars. The movement’s founder – French poet Andre Breton – was influenced heavily by Freud’s theories, as he reacted against reason and logic in order to free the imagination from the unconscious mind. Surrealist works, both visual and oral, juxtaposed seemingly unrelated everyday objects and placed these in dreamlike settings. Thus, the popularity of surrealist paintings, including Salvador Dali’s, lies in the unconventional positioning of powerful images such as leaping tigers, melting watches and metronomes. Surrealist art is widely known today, unlike the less easily accessible works of the French surrealist writers who, ignoring the literal meanings of words, focused instead on word associations and implications. That said, the literary surrealist tradition still survives in modern-day proponents of experimental writing.`,
  TEST8_P2: `Huge controversy surrounded the construction between 1994 and 2006 of what was the world’s largest hydroelectric dam, the Three Gorges Dam. Spanning China’s 1.4-mile wide Yangtze River in the Hubei province with twenty-six state-of-the-art turbines, the dam has been heralded by the Chinese state as a symbol of China’s modernisation and engineering prowess. It supports China’s economic development by supplying over ten percent of its electricity. However, over 1.3 million people were deliberately displaced as part of the Gorges flooding project that created the dam’s 660km-long reservoir. Hundreds of archaeological sites, initially above and below ground level, were lost under the reservoir’s water. Questions remain as to whether the dam – as a source of renewable energy – benefits the surrounding environment, or depletes it by causing, for example, landslides and the death of fish species in the Yangtze. Supporters argue that the Dam’s deepening of the river has made the Yangtze easier for large ships to navigate and has reduced the risk of flooding downstream. As the only other viable Chinese energy source continues to be non-renewable coal power, the hydroelectric power generated by the dam may be the lesser of two evils.`,
  TEST8_P3: `Outsourcing – purchasing services from an external supplier rather than performing the work internally – is a popular but politically sensitive means of cutting costs. There has been an increasing use of third parties for HR functions, such as managing payroll and other employee data, and for traditional Finance functions, such as invoice services. The manufacture of goods has even become part of this trend; though the design function is typically kept in-house. Third party call centre operatives can offer customer service expertise that may be more expensive to provide in-house. “Offshoring”, when functions are moved abroad, often to India or China, where the average wage is considerably lower raises job protection issues. The potential profits from outsourcing operations encourage underdeveloped countries to invest in the necessary educational infrastructure and skills training that are required to support such business. Still, higher corporate profits may be seen to be at the expense of low-wage economies, and the cost benefits are not always passed on to the consumer. Additionally the consumer may not benefit from an improved quality of customer service. Outsourcing decreases prices in another way – the competitive marketplace in which service providers companies operate gets squeezed as they vie for client contracts.`,
  TEST8_P4: `Hydrogen-fuelled cars are not reliant upon petrol or diesel, which potentially makes them safer. Hydrogen fuel can be produced from renewable sources, such as wind or solar power, and does not have the ordinary car’s dependency on burning fossil fuels. Since cars account for roughly a third of greenhouse gas emissions, these futuristic vehicles could form part of an effective strategy to combat global warming. This is an idealistic scenario and there are many barriers to be overcome first. The existing designs for hydrogen fuelled cars are extremely expensive. The National Research Association also estimates that £8 billion would be needed to set-up the refuelling stations required by hydrogen-fuelled cars. For a mass market product to be developed there needs to be increased cooperation between governments and industry to allow the infrastructure to lead the manufacture. In fact, hybrid and hybrid-electric car designs may prove to be a more worthwhile long-term investment for governments. Compared to ordinary cars, hybrids emit reduced levels of carbon dioxide, whereas hydrogen-fuelled cars emit only water and so are 100% clean.`,
  TEST9_P1: `As their name suggests, Asian carp are not indigenous to the United States, yet these invasive fish have become the subject of a Supreme Court lawsuit. Introduced in the US in 1831, carp were originally intended for consumption although today they are not widely eaten. Populations have flourished in the Mississippi and Illinois Rivers since the 1970s, when it is thought that they escaped from Midwestern fish farms during heavy flooding. Carp consume only plankton, although vast amounts of it, and some species of Asian carp can grow to over one hundred pounds. Not only are the fish a hazard to recreational boaters, they also compete with native species for food and space. Environmentalists fear that carp will infiltrate the Great Lakes, via locks connecting the Mississippi to Lake Michigan, where they would damage the ecosystem. They also fear that by crowding out species such as salmon, Asian carp would also be detrimental to the Great Lakes’ sports fishing industry. The US government currently spends $80 million per annum on Asian carp control, using methods such as toxins and underwater electric barriers designed to repel carp. Evidence of carp in Lake Michigan however has led to an-ticarp activists to call for stronger measures, such as blocking off the locks on the Chicago canal. Business interests strongly oppose the closure of this major shipping lane for economic reasons, also arguing that forcing canal traffic onto the roads will cause pollution.`,
  TEST9_P2: `The most prevalent neurological condition in the developed world, migraine is characterised by severe, recurrent headaches, with additional symptoms including nausea and sensitivity to light and sound. The frequency and duration of migraine attacks are variable: attacks may occur a few times a year or several times per month, while pain may last between four hours and three days. Approximately one third of sufferers experience an aura – a perceptual disturbance occurring before the migraine’s onset. There are numerous theories on the cause of migraines. The vascular theory posits that migraines are caused by problems with blood vessels in the brain. A more widely held view is that migraines result from low levels of the neurotransmitter serotonin in the brain. Prophylactic drug treatment, which prevents the onset of migraines, has declined in recent years, because of side effects and also improvements in medications treating an actual attack. Whereas older varieties of pain medication are potentially addictive, newer drugs called triptans work by reducing pain information travelling to the brain. Treatment plans typically include avoidance of known migraine triggers, such as diet, alcohol, and stress, as overuse of medication can lead to chronic “rebound headaches.” Not only do migraines have a debilitating effect on sufferers, they are also bad for the economy, with an estimated 25 million days lost from work every year in the UK alone.`,
  TEST9_P3: `Is free internet access as much a universal human right as access to clean water and healthcare? Many leading experts believe that the 80% of the world’s population that is not connected to the web should have access to information through free low-bandwidth connection via mobile phones. The one fifth of the world connected to the internet, however, faces a very different problem: an insatiable appetite for bandwidth that outstrips availability. Bandwidth refers to the capacity to transfer data through a channel. Emails, for example, require less bandwidth than video. Information traffic jams result when too many users try to move information at the same time, exceeding the channel’s capacity. The popularity of mobile web devices means demand for wireless channels is growing rapidly, but bandwidth supply is limited – resulting in high charges for use. With bandwidth controlled by a handful of private suppliers, bandwidth is the subject of government debate in many countries, including the United States. Bandwidth suppliers are in favour of introducing tiered pricing structures, whereby customers paying higher rates would receive faster service. Critics believe that a tiered system violates the principle of net neutrality – whereby all data is treated as equal – and would allow suppliers to profiteer from controlling a scarce resource. Suppliers argue that they are funding huge infrastructure updates – such as switching from copper wires to expensive fiberoptics – in order to improve services.`,
  TEST9_P4: `The Dead Sea Scrolls are probably the most significant archaeological discovery of the twentieth century. More than 800 ancient documents, written on papyrus and parchment, were found in 1947 in desert caves at Qumran, near the Dead Sea. The texts mainly date from between the last century BCE and the first century CE and are comprised of three types of document: copies of books from the Hebrew Bible; apocryphal manuscripts; and documents pertaining to the beliefs and practices of a sectarian community. The former category is arguably of the greatest academic significance, as documents such as a complete copy of the Book of Isaiah enabled historians to analyse the accuracy of Bible translations. However, the secrecy of the scholars appointed by the Israeli Antiquities Authority, and their slow rate of publication, were the subject of international controversy. In 1991, the Huntington Library made photographic images of the full set of scrolls finally available to all researchers. While the scrolls’ importance is indisputable, there is no consensus over the texts’ origins. The traditional view is that the scrolls belonged to an ascetic Jewish sect, widely believed to be the Essenes. The Essenes’ rules and doctrines are even seen by some scholars as a precursor to Christianity. A competing theory holds that the documents are sacred texts belonging to various Jewish communities, hidden in the caves for safekeeping around 68CE, during the unsuccessful Jewish Revolt against the Romans in Jerusalem.`,
  TEST10_P1: `Founded in 1954, the Bilderberg Group holds an annual conference of 120 of the world’s most powerful and influential people. Participants from 18 different countries, invited by a steering committee comprised of two people, typically include financiers, industrialists, politicians, royalty and newspaper editors. Past delegates have included Tony Blair and Bill Clinton, shortly before becoming heads of state. Reporters, however, are not invited: the Bilderberg Group’s meetings are conducted in privacy, with strict confidentiality rules to foster open discussion. The Group was established to promote understanding and cooperation between the United States and Europe and to create an informal network for the global elite. No votes are taken at the conference and no policies are agreed. However, the secrecy surrounding the conferences has given rise to numerous conspiracy theories. Right-wing critics believe that the Bilderberg Group is a shadowy global government, with some conspiracy theorists holding the Group responsible for organising events including the overthrow of Margaret Thatcher, the Bosnian War and the invasion of Iraq. Left-wing activists, who call for greater transparency, accuse the Group of being an unelected capitalist cabal controlling world finance. While opponents view the Group as undemocratic, supporters argue that modern democracies depend on cooperation between banking and politics, and that organisations such as the Bilderberg Group help ensure their success.`,
  TEST10_P2: `Although today used to describe any movement to claim back territory for ethnic, linguistic, geographical or historical reasons, the term irredentism originally came from the Italian nationalist movement Italia irredenta. Meaning “unredeemed Italy”, Italian irredentism was an opinion movement rather than a formal organisation. It sought to unify ethnically Italian territories, such as Trieste, Trentina, and Istria, that were outside of Italian borders at the time of the unification of Italy in 1866. The annexation of these Italian territories from Austria provided Italy with its strongest motive for participating in World War I. The Treaty of Versailles in 1919 satisfied most of Italy’s irredentist claims, however new borders delineated by the treaty gave rise to new irredentist claims. Dividing the German Empire into separate nations created German minority populations in the new countries of Poland and Hungary. German irredentist claims to these territories, as well as to Austria, resulted in the Second World War. The Treaty of Versailles created Yugoslavia to be a Slavic homeland, but ethnic and religious differences between Bosnians, Serbs and Croats eventually led to war in the 1990s. The artificial political states created by the Treaty of Versailles in East Africa failed to take tribal boundaries into account, and thus remain subject to irredentist claims. Similarly, borders drawn up in the Near East are still contentious today.`,
  TEST10_P3: `Many organisations predict that the global water crisis presents this century’s biggest threat. Today 84% of people in developing countries have access to clean water, 2 billion more than in 1990. However, millions still lack clean water for drinking and sanitation, posing a major health threat. In the developed world, water consumption is unsustainably high, doubling every twenty years. Agriculture accounts for 70% of the world’s fresh water use, and an increasing population to feed means this demand will only increase. Groundwater sources, used to irrigate crops, are running dry because of overuse. While limiting the use of groundwater is a possible solution, it would have a financial impact on farmers and result in lower yields. While climate change has resulted in increased precipitation in some areas, it is contributing to water shortages in other regions. Rising temperatures have caused the Himalayan glaciers, the source for all of Asia’s major rivers, to retreat. A`,
  TEST10_P4: `A nanometre is a billionth of a metre, and nanotechnology is the application of science and engineering at this atomic and molecular level. Nanotechnology enables the manipulation of matter with at least one dimension sized from 1 to 100 nanometres. Already used in the manufacture of products including computer hard drives, clothing, and sunscreen, nanotechnology is predicted to have a major impact on fields as diverse as medicine, space exploration and electronics. There is much debate about the future implications of nanotechnology. On the one hand, enthusiasts believe it could bring huge benefits to mankind, such as providing clean energy, and more effective medical treatments. On the other hand, critics predict that nanotechnology could create problems, for example, new toxins and weapons. Some observers believe that nanotechnology could even lead to a post-scarcity economy and the end of aging. One of the more pessimistic scenarios is that self-replicating nanobots could get out of control and consume the Earth’s ecosystem, a doomsday scenario known as the grey goo problem. To address such concerns, proponents of nanotechnology advocate strict regulation of the field and the establishment of a global watchdog organisation.`,
  TEST11_P1: `The UK’s first large-scale wind farm was built in 1991 in Cornwall, and there are now over 300 wind farms on and offshore in the UK. One of the benefits of wind power is that it is a clean source of renewable energy that does not emit greenhouse gases. Not only is wind power sustainable, it is also one of the most cost-effective sources of power. As a result, the UK is on track to meet its EU target of generating 15% of its energy from renewable sources by 2020. Despite its environmental credentials, wind power has not been met with universal approval. One of the main concerns is that wind farms are noisy and unsightly. While the UK government has introduced strict noise limits, the visual impact of wind farms is more subjective. To address complaints about the appearance of wind farms, many are now located offshore. There is evidence that offshore wind farms have a negative impact on marine life. A more common objection to both on and offshore wind farms is that they harm birds. While numerous studies have shown that wind farms are not a significant threat to bird populations, developers are required to carry out an environmental impact assessment before a new farm can be constructed.`,
  TEST11_P2: `Popularly known as lie detectors, polygraph tests are used in over fifty countries worldwide. The first polygraph test was invented by John Larson in 1921. It measured subjects’ blood pressure and breathing rate to ascertain whether they were telling the truth. In 1938, Leonarde Keeler added a third physiological measuring component that is still in use today: the galvanic skin response. This component measures the skin’s electrical conductivity, which is affected by sweat. It is theorized that the fear of being caught lying causes physiological changes that can be detected by a polygraph test. In the United States, polygraph tests are most frequently used in police investigations and to screen government and law enforcement employees. The tests are so controversial, however, that the state of New Mexico has banned their use in court altogether. While proponents of the test claim that polygraphs are 90% accurate, a 2003 review by the National Academy of Sciences found that polygraph testing is not reliable enough to be used for security screening. One of the main flaws of the test is that it cannot distinguish between the anxiety caused by lying and other emotions, such as the fear of being wrongly accused.`,
  TEST11_P3: `The discovery of penicillin, one of the world’s first antibiotics, is famously attributed to Alexander Fleming’s accidental contamination of a petri dish in 1928. However, it was not until World War II that the drug was mass-produced. Howard Florey and Ernst Chain, who shared the 1945 Nobel Prize for Medicine with Fleming, developed a method of purifying penicillin that enabled it to be used as a medicine. Since the discovery of penicillin, antibiotics have saved hundreds of millions of lives. However, these life-saving drugs are becoming less effective due to the emergence of antibiotic-resistant bacteria. Bacteria become resistant to antibiotics when they are exposed to amounts of the drug that are not high enough to kill them. This can occur when a patient does not complete their full course of antibiotics. In addition to medical uses, antibiotics are also widely used in agriculture to promote animal growth. The overuse of antibiotics has led to the emergence of “superbugs”, strains of bacteria that are resistant to multiple antibiotics. In the United States, it is estimated that 2 million people are infected with antibiotic-resistant bacteria annually, with 23,000 cases resulting in death. While the development of new antibiotics is one way to combat this growing threat, doctors are also urged to use more restraint when prescribing antibiotics.`,
  TEST11_P4: `Of the five main tastes – sweet, salty, sour, bitter and umami – bitter is the most sensitive. Bitterness is a warning sign that a substance may be poisonous, and the ability to detect it is a key survival mechanism. There is evidence that sensitivity to bitterness is a genetic trait. In 1931, a DuPont chemist named Arthur Fox accidentally released a cloud of a chemical called phenylthiocarbamide (PTC). While some of his colleagues complained about the chemical’s bitter taste, Fox, who was closer to the substance, tasted nothing. Subsequent research confirmed that there is a genetic basis for the ability to taste PTC. It is now known that there are two main alleles – or variations of a gene – for the ability to taste PTC. The “taster” allele is dominant, so anyone who inherits even one copy will be able to taste PTC. People with two copies of the “non-taster” allele, however, are unable to taste the chemical. It is now thought that the ability to taste PTC is correlated with the ability to taste other bitter substances, many of which are found in vegetables. This has led some scientists to speculate that PTC “non-tasters” are more likely to have a diet high in vegetables than “tasters.”`,
};

const QUANTITATIVE_GRAPHS = {
    TEST1_Q1_Q2: {
        type: 'bar',
        title: 'Sales of Silver Goods at T.H. Bausil\'s, 1993-94 (£ thousands)',
        labels: ['Jan-Mar 93', 'Apr-Jun 93', 'Jul-Sep 93', 'Oct-Dec 93', 'Jan-Mar 94', 'Apr-Jun 94'],
        yAxisLabel: 'Sales (£ thousands)',
        datasets: [
          {
            label: 'Earnings',
            data: [180, 240, 350, 420, 220, 280],
            backgroundColor: '#3B82F6'
          }
        ]
    } as GraphData,
    TEST1_Q3_Q4: {
        type: 'bar',
        title: 'Number of Consumer Goods (in thousands) manufactured, sold, and in stock',
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        yAxisLabel: 'Number of Items (thousands)',
        datasets: [
          {
            label: 'Manufactured',
            data: [35, 30, 45, 50, 40],
            backgroundColor: '#10B981'
          },
          {
            label: 'Sold',
            data: [25, 35, 35, 40, 45],
            backgroundColor: '#F97316'
          },
           {
            label: 'Stock',
            data: [20, 15, 25, 35, 30],
            backgroundColor: '#6366F1'
          }
        ]
    } as GraphData,
     TEST1_Q5_Q7: {
        type: 'bar',
        title: 'Internet Use by Age Group and Gender',
        labels: ['16-24', '25-44', '45-64', '65-74', '75+'],
        yAxisLabel: 'Percentage of Age Group',
        datasets: [
          {
            label: 'Men',
            data: [88, 89, 76, 42, 16],
            backgroundColor: '#3B82F6'
          },
          {
            label: 'Women',
            data: [88, 87, 72, 38, 14],
            backgroundColor: '#EC4899'
          }
        ]
    } as GraphData
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
  "Nnamdi Azikiwe University",
  "Obafemi Awolu University",
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
    "Test 1": [
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g fill="none" stroke="#000" stroke-width="2"><g transform="translate(10 10)"><rect width="40" height="40"/><circle cx="20" cy="20" r="10"/></g><g transform="translate(70 10)"><rect width="40" height="40"/><rect x="10" y="10" width="20" height="20"/></g><g transform="translate(130 10)"><rect width="40" height="40"/><path d="M10 30 L 20 10 L 30 30 Z"/></g><g transform="translate(190 10)"><rect width="40" height="40"/><rect x="10" y="10" width="20" height="20" rx="10"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><path d="M10 10 L 30 30 M 10 30 L 30 10"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><path d="M10 30 L 20 10 L 30 30 Z"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><circle cx="20" cy="20" r="10"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><rect x="10" y="10" width="20" height="20"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><rect x="10" y="10" width="20" height="20" rx="10"/></g></svg>`,
        ],
        correctAnswer: "A",
        explanation: "The inner shape changes with each step in the sequence: Circle, Square, Triangle, Oval. The next logical shape would be different from the previous ones. The 'X' shape is a new addition.",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g fill="none" stroke="#000" stroke-width="2"><g transform="translate(10 10)"><circle cx="20" cy="20" r="18"/><path d="M20 2 L 20 38"/></g><g transform="translate(70 10)"><circle cx="20" cy="20" r="18"/><path d="M20 2 L 20 38" transform="rotate(45 20 20)"/></g><g transform="translate(130 10)"><circle cx="20" cy="20" r="18"/><path d="M2 20 L 38 20"/></g><g transform="translate(190 10)"><circle cx="20" cy="20" r="18"/><path d="M2 20 L 38 20" transform="rotate(45 20 20)"/></g><g transform="translate(250 10)"><rect width="40" height="40" x="5" y="5" stroke-dasharray="4 4"/><text x="25" y="35" font-size="24" text-anchor="middle">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><circle cx="20" cy="20" r="18"/><path d="M20 2 L 20 38"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><circle cx="20" cy="20" r="18"/><path d="M20 2 L 20 38" transform="rotate(45 20 20)"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><circle cx="20" cy="20" r="18"/><path d="M2 20 L 38 20"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><circle cx="20" cy="20" r="18"/><path d="M2 20 L 38 20" transform="rotate(45 20 20)"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><circle cx="20" cy="20" r="18"/><path d="M20 2 L 20 38" transform="rotate(90 20 20)"/></g></svg>`,
        ],
        correctAnswer: "A",
        explanation: "The line inside the circle rotates 45 degrees clockwise at each step. The last step was a diagonal line, so the next step is a vertical line.",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g fill="none" stroke="#000" stroke-width="2"><g transform="translate(10 10)"><rect width="40" height="40"/><circle cx="10" cy="10" r="5" fill="#000"/></g><g transform="translate(70 10)"><rect width="40" height="40"/><circle cx="30" cy="10" r="5" fill="#000"/></g><g transform="translate(130 10)"><rect width="40" height="40"/><circle cx="30" cy="30" r="5" fill="#000"/></g><g transform="translate(190 10)"><rect width="40" height="40"/><circle cx="10" cy="30" r="5" fill="#000"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><circle cx="10" cy="10" r="5" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><circle cx="30" cy="10" r="5" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><circle cx="30" cy="30" r="5" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><circle cx="10" cy="30" r="5" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><circle cx="20" cy="20" r="5" fill="#000"/></g></svg>`,
        ],
        correctAnswer: "A",
        explanation: "The black circle moves clockwise around the corners of the square. The sequence is top-left, top-right, bottom-right, bottom-left. The pattern then repeats, so the next position is top-left.",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g fill="none" stroke="#000" stroke-width="1"><g transform="translate(10 10)"><rect width="40" height="40"/><path d="M0 0 L 40 40"/></g><g transform="translate(70 10)"><rect width="40" height="40"/><path d="M0 0 L 40 40 M 40 0 L 0 40"/></g><g transform="translate(130 10)"><rect width="40" height="40"/><path d="M0 0 L 40 40 M 40 0 L 0 40 M 20 0 L 20 40"/></g><g transform="translate(190 10)"><rect width="40" height="40"/><path d="M0 0 L 40 40 M 40 0 L 0 40 M 20 0 L 20 40 M 0 20 L 40 20"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="1"><rect width="40" height="40"/><path d="M0 0 L 40 40"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="1"><rect width="40" height="40"/><path d="M0 0 L 40 40 M 40 0 L 0 40"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="1"><rect width="40" height="40"/><path d="M0 0 L 40 40 M 40 0 L 0 40 M 20 0 L 20 40"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="1"><rect width="40" height="40"/><path d="M0 0 L 40 40 M 40 0 L 0 40 M 20 0 L 20 40 M 0 20 L 40 20"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="1"><rect width="40" height="40"/><path d="M0 0 L 40 40 M 40 0 L 0 40 M 20 0 L 20 40 M 0 20 L 40 20"/><circle cx="20" cy="20" r="10"/></g></svg>`,
        ],
        correctAnswer: "E",
        explanation: "A new line is added to the box at each step. The sequence of added lines is: diagonal top-left to bottom-right, diagonal top-right to bottom-left, vertical middle, horizontal middle. The next logical step is to add a new shape, like a circle, in the center.",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g fill="#000"><g transform="translate(10 10)"><path d="M20 0 L 25 10 L 15 10 Z"/></g><g transform="translate(70 10)"><path d="M20 0 L 25 10 L 15 10 Z"/><path d="M20 40 L 15 30 L 25 30 Z"/></g><g transform="translate(130 10)"><path d="M20 0 L 25 10 L 15 10 Z"/><path d="M20 40 L 15 30 L 25 30 Z"/><path d="M0 20 L 10 15 L 10 25 Z"/></g><g transform="translate(190 10)"><path d="M20 0 L 25 10 L 15 10 Z"/><path d="M20 40 L 15 30 L 25 30 Z"/><path d="M0 20 L 10 15 L 10 25 Z"/><path d="M40 20 L 30 25 L 30 15 Z"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke="#000" stroke-width="2" fill="none" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#000"><path d="M20 0 L 25 10 L 15 10 Z"/><path d="M20 40 L 15 30 L 25 30 Z"/><path d="M0 20 L 10 15 L 10 25 Z"/><path d="M40 20 L 30 25 L 30 15 Z"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#000"><path d="M20 0 L 25 10 L 15 10 Z"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#000"><path d="M20 0 L 25 10 L 15 10 Z"/><path d="M20 40 L 15 30 L 25 30 Z"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#000"><path d="M20 0 L 25 10 L 15 10 Z"/><path d="M20 40 L 15 30 L 25 30 Z"/><path d="M0 20 L 10 15 L 10 25 Z"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#000"><path d="M20 0 L 25 10 L 15 10 Z"/><path d="M20 40 L 15 30 L 25 30 Z"/><path d="M0 20 L 10 15 L 10 25 Z"/><path d="M40 20 L 30 25 L 30 15 Z"/><rect x="15" y="15" width="10" height="10"/></g></svg>`,
        ],
        correctAnswer: "E",
        explanation: "A new triangle pointing inwards is added to each side of the square frame at each step. The sequence is top, bottom, left, right. The next logical step is to add a new shape in the center.",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g stroke="#000" stroke-width="2" fill="none"><g transform="translate(10 10)"><rect x="0" y="15" width="10" height="10"/><rect x="15" y="15" width="10" height="10"/><rect x="30" y="15" width="10" height="10"/></g><g transform="translate(70 10)"><rect x="0" y="15" width="10" height="10" fill="#000"/><rect x="15" y="15" width="10" height="10"/><rect x="30" y="15" width="10" height="10"/></g><g transform="translate(130 10)"><rect x="0" y="15" width="10" height="10"/><rect x="15" y="15" width="10" height="10" fill="#000"/><rect x="30" y="15" width="10" height="10"/></g><g transform="translate(190 10)"><rect x="0" y="15" width="10" height="10"/><rect x="15" y="15" width="10" height="10"/><rect x="30" y="15" width="10" height="10" fill="#000"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><rect x="0" y="15" width="10" height="10"/><rect x="15" y="15" width="10" height="10"/><rect x="30" y="15" width="10" height="10"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><rect x="0" y="15" width="10" height="10" fill="#000"/><rect x="15" y="15" width="10" height="10"/><rect x="30" y="15" width="10" height="10"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><rect x="0" y="15" width="10" height="10"/><rect x="15" y="15" width="10" height="10" fill="#000"/><rect x="30" y="15" width="10" height="10"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><rect x="0" y="15" width="10" height="10"/><rect x="15" y="15" width="10" height="10"/><rect x="30" y="15" width="10" height="10" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><rect x="0" y="15" width="10" height="10" fill="#000"/><rect x="15" y="15" width="10" height="10" fill="#000"/><rect x="30" y="15" width="10" height="10"/></g></svg>`,
        ],
        correctAnswer: "B",
        explanation: "The shading moves one square to the right at each step. After the rightmost square is shaded, the pattern resets to the leftmost square. So the next step is the leftmost square shaded.",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g fill="none" stroke="#000" stroke-width="2"><g transform="translate(10 10)"><rect width="40" height="40"/><path d="M20 10 V 30 M 10 20 H 30"/></g><g transform="translate(70 10)"><rect width="40" height="40"/><path d="M20 10 V 30 M 10 20 H 30" transform="rotate(45 20 20)"/></g><g transform="translate(130 10)"><rect width="40" height="40"/><path d="M20 10 V 30 M 10 20 H 30" transform="rotate(90 20 20)"/></g><g transform="translate(190 10)"><rect width="40" height="40"/><path d="M20 10 V 30 M 10 20 H 30" transform="rotate(135 20 20)"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><path d="M20 10 V 30 M 10 20 H 30"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><path d="M20 10 V 30 M 10 20 H 30" transform="rotate(45 20 20)"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><path d="M20 10 V 30 M 10 20 H 30" transform="rotate(90 20 20)"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><path d="M20 10 V 30 M 10 20 H 30" transform="rotate(135 20 20)"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><path d="M20 10 V 30 M 10 20 H 30" transform="rotate(180 20 20)"/></g></svg>`,
        ],
        correctAnswer: "E",
        explanation: "The plus symbol inside the square rotates 45 degrees clockwise at each step. The next rotation will make the plus symbol appear vertical and horizontal again (rotated 180 degrees from the start).",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g fill="none" stroke="#000" stroke-width="2"><g transform="translate(10 10)"><path d="M0 20 L 40 20"/></g><g transform="translate(70 10)"><path d="M0 20 L 40 20"/><path d="M20 0 L 20 40"/></g><g transform="translate(130 10)"><path d="M0 20 L 40 20"/><path d="M20 0 L 20 40"/><path d="M5 5 L 35 35"/></g><g transform="translate(190 10)"><path d="M0 20 L 40 20"/><path d="M20 0 L 20 40"/><path d="M5 5 L 35 35"/><path d="M35 5 L 5 35"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><path d="M0 20 L 40 20"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><path d="M0 20 L 40 20"/><path d="M20 0 L 20 40"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><path d="M0 20 L 40 20"/><path d="M20 0 L 20 40"/><path d="M5 5 L 35 35"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><path d="M0 20 L 40 20"/><path d="M20 0 L 20 40"/><path d="M5 5 L 35 35"/><path d="M35 5 L 5 35"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><path d="M0 20 L 40 20"/><path d="M20 0 L 20 40"/><path d="M5 5 L 35 35"/><path d="M35 5 L 5 35"/><rect width="40" height="40"/></g></svg>`,
        ],
        correctAnswer: "E",
        explanation: "A new line is added at each step, creating a star-like pattern. The next logical addition is the square frame around the existing lines.",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g fill="none" stroke="#000" stroke-width="2"><g transform="translate(10 10)"><circle cx="20" cy="20" r="15"/><circle cx="20" cy="20" r="8"/></g><g transform="translate(70 10)"><rect x="5" y="5" width="30" height="30"/><rect x="12" y="12" width="16" height="16"/></g><g transform="translate(130 10)"><path d="M5 35 L 20 5 L 35 35 Z"/><path d="M12 28 L 20 15 L 28 28 Z"/></g><g transform="translate(190 10)"><circle cx="20" cy="20" r="15"/><rect x="12" y="12" width="16" height="16"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><circle cx="20" cy="20" r="15"/><circle cx="20" cy="20" r="8"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect x="5" y="5" width="30" height="30"/><rect x="12" y="12" width="16" height="16"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><path d="M5 35 L 20 5 L 35 35 Z"/><path d="M12 28 L 20 15 L 28 28 Z"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><circle cx="20" cy="20" r="15"/><rect x="12" y="12" width="16" height="16"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect x="5" y="5" width="30" height="30"/><path d="M12 28 L 20 15 L 28 28 Z"/></g></svg>`,
        ],
        correctAnswer: "E",
        explanation: "The outer shape cycles through Circle, Square, Triangle. The inner shape cycles through Circle, Square, Triangle. The fourth box combines the outer shape of the first (Circle) and inner of the second (Square). The fifth box should combine the outer shape of the second (Square) and the inner shape of the third (Triangle).",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g fill="#000"><g transform="translate(10 10)"><circle cx="20" cy="20" r="3"/></g><g transform="translate(70 10)"><circle cx="15" cy="20" r="3"/><circle cx="25" cy="20" r="3"/></g><g transform="translate(130 10)"><circle cx="15" cy="15" r="3"/><circle cx="25" cy="15" r="3"/><circle cx="20" cy="25" r="3"/></g><g transform="translate(190 10)"><circle cx="15" cy="15" r="3"/><circle cx="25" cy="15" r="3"/><circle cx="15" cy="25" r="3"/><circle cx="25" cy="25" r="3"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke="#000" stroke-width="2" fill="none" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#000"><circle cx="20" cy="20" r="3"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#000"><circle cx="15" cy="20" r="3"/><circle cx="25" cy="20" r="3"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#000"><circle cx="15" cy="15" r="3"/><circle cx="25" cy="15" r="3"/><circle cx="20" cy="25" r="3"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#000"><circle cx="15" cy="15" r="3"/><circle cx="25" cy="15" r="3"/><circle cx="15" cy="25" r="3"/><circle cx="25" cy="25" r="3"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#000"><circle cx="15" cy="15" r="3"/><circle cx="25" cy="15" r="3"/><circle cx="15" cy="25" r="3"/><circle cx="25" cy="25" r="3"/><circle cx="20" cy="20" r="3"/></g></svg>`,
        ],
        correctAnswer: "E",
        explanation: "The number of dots increases by one at each step, forming a pattern similar to the dots on a die. The sequence is 1, 2, 3, 4. The next number is 5.",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g fill="none" stroke="#000" stroke-width="2"><g transform="translate(10 10)"><rect width="40" height="40"/><path d="M0 40 L 40 0"/></g><g transform="translate(70 10)"><rect width="40" height="40" transform="rotate(15 20 20)"/><path d="M0 40 L 40 0" transform="rotate(15 20 20)"/></g><g transform="translate(130 10)"><rect width="40" height="40" transform="rotate(30 20 20)"/><path d="M0 40 L 40 0" transform="rotate(30 20 20)"/></g><g transform="translate(190 10)"><rect width="40" height="40" transform="rotate(45 20 20)"/><path d="M0 40 L 40 0" transform="rotate(45 20 20)"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40" transform="rotate(55 20 20)"/><path d="M0 40 L 40 0" transform="rotate(55 20 20)"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40" transform="rotate(60 20 20)"/><path d="M0 40 L 40 0" transform="rotate(60 20 20)"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40" transform="rotate(75 20 20)"/><path d="M0 40 L 40 0" transform="rotate(75 20 20)"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40" transform="rotate(90 20 20)"/><path d="M0 40 L 40 0" transform="rotate(90 20 20)"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40" transform="rotate(50 20 20)"/><path d="M0 40 L 40 0" transform="rotate(50 20 20)"/></g></svg>`,
        ],
        correctAnswer: "B",
        explanation: "The entire figure rotates clockwise by 15 degrees at each step. The last rotation was to 45 degrees, so the next rotation is to 60 degrees (45 + 15).",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g fill="none" stroke="#000" stroke-width="2"><g transform="translate(10 10)"><rect x="15" y="0" width="10" height="10" fill="#000"/></g><g transform="translate(70 10)"><rect x="15" y="0" width="10" height="10"/><rect x="15" y="15" width="10" height="10" fill="#000"/></g><g transform="translate(130 10)"><rect x="15" y="0" width="10" height="10"/><rect x="15" y="15" width="10" height="10"/><rect x="15" y="30" width="10" height="10" fill="#000"/></g><g transform="translate(190 10)"><rect x="15" y="0" width="10" height="10"/><rect x="15" y="15" width="10" height="10"/><rect x="15" y="30" width="10" height="10"/><rect x="0" y="15" width="10" height="10" fill="#000"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect x="15" y="0" width="10" height="10" fill="#000"/><rect x="15" y="15" width="10" height="10"/><rect x="15" y="30" width="10" height="10"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect x="15" y="0" width="10" height="10"/><rect x="15" y="15" width="10" height="10"/><rect x="15" y="30" width="10" height="10"/><rect x="30" y="15" width="10" height="10" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect x="15" y="0" width="10" height="10"/><rect x="15" y="15" width="10" height="10" fill="#000"/><rect x="15" y="30" width="10" height="10"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect x="15" y="0" width="10" height="10"/><rect x="15" y="15" width="10" height="10"/><rect x="15" y="30" width="10" height="10"/><rect x="0" y="15" width="10" height="10"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect x="15" y="0" width="10" height="10" fill="#000"/></g></svg>`,
        ],
        correctAnswer: "B",
        explanation: "The shaded square moves around the cross shape. First down the vertical bar, then to the left arm. The next position is the right arm.",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g fill="#fff" stroke="#000" stroke-width="2"><g transform="translate(10 10)"><path d="M0 0 H 40 V 40 H 0 Z M 0 20 H 40 M 20 0 V 40"/><path d="M0 0 H 20 V 20 H 0 Z" fill="#000"/></g><g transform="translate(70 10)"><path d="M0 0 H 40 V 40 H 0 Z M 0 20 H 40 M 20 0 V 40"/><path d="M20 0 H 40 V 20 H 20 Z" fill="#000"/></g><g transform="translate(130 10)"><path d="M0 0 H 40 V 40 H 0 Z M 0 20 H 40 M 20 0 V 40"/><path d="M20 20 H 40 V 40 H 20 Z" fill="#000"/></g><g transform="translate(190 10)"><path d="M0 0 H 40 V 40 H 0 Z M 0 20 H 40 M 20 0 V 40"/><path d="M0 20 H 20 V 40 H 0 Z" fill="#000"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke-dasharray="4 4" fill="none"/><text x="20" y="30" font-size="24" text-anchor="middle" stroke="none" fill="#000">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#fff" stroke="#000" stroke-width="2"><path d="M0 0 H 40 V 40 H 0 Z M 0 20 H 40 M 20 0 V 40"/><path d="M0 0 H 20 V 20 H 0 Z" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#fff" stroke="#000" stroke-width="2"><path d="M0 0 H 40 V 40 H 0 Z M 0 20 H 40 M 20 0 V 40"/><path d="M20 0 H 40 V 20 H 20 Z" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#fff" stroke="#000" stroke-width="2"><path d="M0 0 H 40 V 40 H 0 Z M 0 20 H 40 M 20 0 V 40"/><path d="M20 20 H 40 V 40 H 20 Z" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#fff" stroke="#000" stroke-width="2"><path d="M0 0 H 40 V 40 H 0 Z M 0 20 H 40 M 20 0 V 40"/><path d="M0 20 H 20 V 40 H 0 Z" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#fff" stroke="#000" stroke-width="2"><path d="M0 0 H 40 V 40 H 0 Z M 0 20 H 40 M 20 0 V 40"/></g></svg>`,
        ],
        correctAnswer: "A",
        explanation: "The shaded quadrant moves clockwise. The sequence is top-left, top-right, bottom-right, bottom-left. The pattern repeats, so the next shaded quadrant is top-left.",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g stroke="#000" stroke-width="2" fill="none"><g transform="translate(10 10)"><rect width="40" height="40"/><circle cx="20" cy="20" r="5" fill="#000"/></g><g transform="translate(70 10)"><rect width="40" height="40"/><circle cx="20" cy="20" r="10" fill="#000"/></g><g transform="translate(130 10)"><rect width="40" height="40"/><circle cx="20" cy="20" r="15" fill="#000"/></g><g transform="translate(190 10)"><rect width="40" height="40"/><circle cx="20" cy="20" r="10" fill="#000"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle" stroke="none" fill="#000">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><rect width="40" height="40"/><circle cx="20" cy="20" r="5" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><rect width="40" height="40"/><circle cx="20" cy="20" r="10" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><rect width="40" height="40"/><circle cx="20" cy="20" r="15" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><rect width="40" height="40"/><circle cx="20" cy="20" r="20" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><rect width="40" height="40"/></g></svg>`,
        ],
        correctAnswer: "A",
        explanation: "The radius of the inner circle increases by 5, then decreases by 5. The sequence of radii is 5, 10, 15, 10. The next radius in the pattern is 5.",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g stroke="#000" stroke-width="2" fill="none"><g transform="translate(10 10)"><path d="M20 0 L 20 40"/></g><g transform="translate(70 10)"><path d="M20 0 L 20 40"/><path d="M10 5 L 30 5"/></g><g transform="translate(130 10)"><path d="M20 0 L 20 40"/><path d="M10 5 L 30 5"/><path d="M10 10 L 30 10"/></g><g transform="translate(190 10)"><path d="M20 0 L 20 40"/><path d="M10 5 L 30 5"/><path d="M10 10 L 30 10"/><path d="M10 15 L 30 15"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle" stroke="none" fill="#000">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><path d="M20 0 L 20 40"/><path d="M10 5 L 30 5"/><path d="M10 10 L 30 10"/><path d="M10 15 L 30 15"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><path d="M20 0 L 20 40"/><path d="M10 5 L 30 5"/><path d="M10 10 L 30 10"/><path d="M10 15 L 30 15"/><path d="M10 20 L 30 20"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><path d="M20 0 L 20 40"/><path d="M10 5 L 30 5"/><path d="M10 10 L 30 10"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><path d="M20 0 L 20 40"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><path d="M20 0 L 20 40"/><path d="M10 5 L 30 5"/><path d="M10 10 L 30 10"/><path d="M10 15 L 30 15"/><path d="M10 35 L 30 35"/></g></svg>`,
        ],
        correctAnswer: "B",
        explanation: "A new horizontal line is added at each step, moving downwards. The next line should be added below the last one.",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g stroke="#000" stroke-width="2" fill="none"><g transform="translate(10 10)"><path d="M0 0 h 40 v 40 h -40 z"/><path d="M0 0 L 20 20 L 0 40 Z" fill="#000"/></g><g transform="translate(70 10)"><path d="M0 0 h 40 v 40 h -40 z"/><path d="M0 0 L 20 20 L 40 0 Z" fill="#000"/></g><g transform="translate(130 10)"><path d="M0 0 h 40 v 40 h -40 z"/><path d="M40 0 L 20 20 L 40 40 Z" fill="#000"/></g><g transform="translate(190 10)"><path d="M0 0 h 40 v 40 h -40 z"/><path d="M40 40 L 20 20 L 0 40 Z" fill="#000"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle" stroke="none" fill="#000">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><path d="M0 0 h 40 v 40 h -40 z"/><path d="M0 0 L 20 20 L 0 40 Z" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><path d="M0 0 h 40 v 40 h -40 z"/><path d="M0 0 L 20 20 L 40 0 Z" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><path d="M0 0 h 40 v 40 h -40 z"/><path d="M40 0 L 20 20 L 40 40 Z" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><path d="M0 0 h 40 v 40 h -40 z"/><path d="M40 40 L 20 20 L 0 40 Z" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><path d="M0 0 h 40 v 40 h -40 z"/></g></svg>`,
        ],
        correctAnswer: "A",
        explanation: "The shaded triangle rotates 90 degrees clockwise around the center of the square. The sequence is left, top, right, bottom. The pattern repeats, so the next position is left.",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g stroke="#000" stroke-width="2" fill="none"><g transform="translate(10 10)"><rect width="40" height="40"/><path d="M10 10 L 30 30 M 10 30 L 30 10" stroke-width="1"/></g><g transform="translate(70 10)"><rect width="40" height="40" stroke-dasharray="3,3"/><path d="M10 10 L 30 30 M 10 30 L 30 10" stroke-width="1"/></g><g transform="translate(130 10)"><rect width="40" height="40"/><circle cx="20" cy="20" r="10"/></g><g transform="translate(190 10)"><rect width="40" height="40" stroke-dasharray="3,3"/><circle cx="20" cy="20" r="10"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle" stroke="none" fill="#000">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><rect width="40" height="40"/><path d="M10 10 L 30 30 M 10 30 L 30 10" stroke-width="1"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><rect width="40" height="40" stroke-dasharray="3,3"/><path d="M10 10 L 30 30 M 10 30 L 30 10" stroke-width="1"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><rect width="40" height="40"/><circle cx="20" cy="20" r="10"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><rect width="40" height="40" stroke-dasharray="3,3"/><circle cx="20" cy="20" r="10"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" stroke="#000" stroke-width="2" fill="none"><rect width="40" height="40"/><path d="M20 10 L 10 30 L 30 30 Z"/></g></svg>`,
        ],
        correctAnswer: "E",
        explanation: "The pattern alternates between two rules. Rule 1: The square border is solid. Rule 2: The square border is dashed. The inner shape also alternates between an 'X' and a circle. The next step should follow Rule 1 (solid border) and introduce a new shape, a triangle.",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g fill="#000"><g transform="translate(10 10)"><rect x="17.5" y="17.5" width="5" height="5"/></g><g transform="translate(70 10)"><rect x="17.5" y="17.5" width="5" height="5"/><rect x="17.5" y="10" width="5" height="5"/></g><g transform="translate(130 10)"><rect x="17.5" y="17.5" width="5" height="5"/><rect x="17.5" y="10" width="5" height="5"/><rect x="25" y="17.5" width="5" height="5"/></g><g transform="translate(190 10)"><rect x="17.5" y="17.5" width="5" height="5"/><rect x="17.5" y="10" width="5" height="5"/><rect x="25" y="17.5" width="5" height="5"/><rect x="17.5" y="25" width="5" height="5"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke="#000" stroke-width="2" fill="none" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#000"><rect x="17.5" y="17.5" width="5" height="5"/><rect x="17.5" y="10" width="5" height="5"/><rect x="25" y="17.5" width="5" height="5"/><rect x="17.5" y="25" width="5" height="5"/><rect x="10" y="17.5" width="5" height="5"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#000"><rect x="17.5" y="17.5" width="5" height="5"/><rect x="17.5" y="10" width="5" height="5"/><rect x="25" y="17.5" width="5" height="5"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#000"><rect x="17.5" y="17.5" width="5" height="5"/><rect x="17.5" y="10" width="5" height="5"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#000"><rect x="17.5" y="17.5" width="5" height="5"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="#000"><rect x="17.5" y="17.5" width="5" height="5"/><rect x="17.5" y="10" width="5" height="5"/><rect x="25" y="17.5" width="5" height="5"/><rect x="17.5" y="25" width="5" height="5"/></g></svg>`,
        ],
        correctAnswer: "A",
        explanation: "Starting with a central dot, a new dot is added in a clockwise direction at each step: top, right, bottom. The next dot should be added to the left.",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g fill="none" stroke="#000" stroke-width="2"><g transform="translate(10 10)"><circle cx="20" cy="20" r="18" fill="#000"/><circle cx="20" cy="20" r="14" fill="#fff"/></g><g transform="translate(70 10)"><circle cx="20" cy="20" r="18" fill="#000"/><circle cx="20" cy="20" r="10" fill="#fff"/></g><g transform="translate(130 10)"><circle cx="20" cy="20" r="18" fill="#000"/><circle cx="20" cy="20" r="6" fill="#fff"/></g><g transform="translate(190 10)"><circle cx="20" cy="20" r="18" fill="#000"/><circle cx="20" cy="20" r="2" fill="#fff"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle" stroke="none" fill="#000">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><circle cx="20" cy="20" r="18" fill="#000"/><circle cx="20" cy="20" r="14" fill="#fff"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><circle cx="20" cy="20" r="18" fill="#000"/><circle cx="20" cy="20" r="10" fill="#fff"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><circle cx="20" cy="20" r="18" fill="#000"/><circle cx="20" cy="20" r="6" fill="#fff"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><circle cx="20" cy="20" r="18" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><circle cx="20" cy="20" r="18" fill="#fff"/></g></svg>`,
        ],
        correctAnswer: "D",
        explanation: "The white inner circle's radius decreases by 4 at each step (14, 10, 6, 2). The next step would have a radius of -2, which means the white circle disappears completely, leaving only the black outer circle.",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g fill="none" stroke="#000" stroke-width="2"><g transform="translate(10 10)"><rect width="40" height="40"/><path d="M5 5 L 15 5 L 15 15 L 5 15 Z" fill="#000"/></g><g transform="translate(70 10)"><rect width="40" height="40"/><path d="M5 5 L 15 5 L 15 15 L 5 15 Z" fill="#000"/><path d="M25 5 L 35 5 L 35 15 L 25 15 Z" fill="#000"/></g><g transform="translate(130 10)"><rect width="40" height="40"/><path d="M5 5 L 15 5 L 15 15 L 5 15 Z" fill="#000"/><path d="M25 5 L 35 5 L 35 15 L 25 15 Z" fill="#000"/><path d="M25 25 L 35 25 L 35 35 L 25 35 Z" fill="#000"/></g><g transform="translate(190 10)"><rect width="40" height="40"/><path d="M5 5 L 15 5 L 15 15 L 5 15 Z" fill="#000"/><path d="M25 5 L 35 5 L 35 15 L 25 15 Z" fill="#000"/><path d="M25 25 L 35 25 L 35 35 L 25 35 Z" fill="#000"/><path d="M5 25 L 15 25 L 15 35 L 5 35 Z" fill="#000"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle" stroke="none" fill="#000">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><path d="M5 5 L 15 5 L 15 15 L 5 15 Z" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><path d="M5 5 L 15 5 L 15 15 L 5 15 Z" fill="#000"/><path d="M25 5 L 35 5 L 35 15 L 25 15 Z" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><path d="M5 5 L 15 5 L 15 15 L 5 15 Z" fill="#000"/><path d="M25 5 L 35 5 L 35 15 L 25 15 Z" fill="#000"/><path d="M25 25 L 35 25 L 35 35 L 25 35 Z" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/><path d="M5 5 L 15 5 L 15 15 L 5 15 Z" fill="#000"/><path d="M25 5 L 35 5 L 35 15 L 25 15 Z" fill="#000"/><path d="M25 25 L 35 25 L 35 35 L 25 35 Z" fill="#000"/><path d="M5 25 L 15 25 L 15 35 L 5 35 Z" fill="#000"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><rect width="40" height="40"/></g></svg>`,
        ],
        correctAnswer: "A",
        explanation: "A new shaded square is added in a clockwise direction at each corner. After all four corners are filled, the pattern resets. The next logical step is to return to the first state with only the top-left square shaded.",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g fill="none" stroke="#000" stroke-width="2"><g transform="translate(10 10)"><path d="M0 0 L 40 40"/></g><g transform="translate(70 10)"><path d="M0 0 L 40 40"/><path d="M0 10 L 30 40"/></g><g transform="translate(130 10)"><path d="M0 0 L 40 40"/><path d="M0 10 L 30 40"/><path d="M0 20 L 20 40"/></g><g transform="translate(190 10)"><path d="M0 0 L 40 40"/><path d="M0 10 L 30 40"/><path d="M0 20 L 20 40"/><path d="M0 30 L 10 40"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle" stroke="none" fill="#000">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><path d="M0 0 L 40 40"/><path d="M0 10 L 30 40"/><path d="M0 20 L 20 40"/><path d="M0 30 L 10 40"/><path d="M10 0 L 40 30"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><path d="M0 0 L 40 40"/><path d="M0 10 L 30 40"/><path d="M0 20 L 20 40"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><path d="M0 0 L 40 40"/><path d="M0 10 L 30 40"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><path d="M0 0 L 40 40"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><path d="M0 0 L 40 40"/><path d="M0 10 L 30 40"/><path d="M0 20 L 20 40"/><path d="M0 30 L 10 40"/><path d="M0 40 L 0 40"/></g></svg>`,
        ],
        correctAnswer: "A",
        explanation: "A series of diagonal lines is being drawn. The first set starts from the left edge and moves down. The next logical step is to start a new set of parallel lines starting from the top edge.",
      },
      {
        question: "Which of the boxes comes next in the sequence?",
        questionImage: `<svg width="340" height="60" viewBox="0 0 340 60"><g fill="none" stroke="#000" stroke-width="2"><g transform="translate(10 10)"><path d="M20,2 L20,12 M10,20 L2,20 M20,38 L20,28 M30,20 L38,20" /></g><g transform="translate(70 10)"><path d="M20,2 L20,12 M10,20 L2,20 M20,38 L20,28 M30,20 L38,20" transform="rotate(45 20 20)"/></g><g transform="translate(130 10)"><path d="M20,2 L20,12 M10,20 L2,20 M20,38 L20,28 M30,20 L38,20" transform="rotate(90 20 20)"/></g><g transform="translate(190 10)"><path d="M20,2 L20,12 M10,20 L2,20 M20,38 L20,28 M30,20 L38,20" transform="rotate(135 20 20)"/></g><g transform="translate(250 10)"><rect width="40" height="40" stroke-dasharray="4 4"/><text x="20" y="30" font-size="24" text-anchor="middle" stroke="none" fill="#000">?</text></g></g></svg>`,
        options: ["A", "B", "C", "D", "E"],
        optionImages: [
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><path d="M20,2 L20,12 M10,20 L2,20 M20,38 L20,28 M30,20 L38,20" transform="rotate(180 20 20)"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><path d="M20,2 L20,12 M10,20 L2,20 M20,38 L20,28 M30,20 L38,20" transform="rotate(150 20 20)"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><path d="M20,2 L20,12 M10,20 L2,20 M20,38 L20,28 M30,20 L38,20" transform="rotate(165 20 20)"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><path d="M20,2 L20,12 M10,20 L2,20 M20,38 L20,28 M30,20 L38,20" transform="rotate(225 20 20)"/></g></svg>`,
          `<svg width="60" height="60" viewBox="0 0 60 60"><g transform="translate(10 10)" fill="none" stroke="#000" stroke-width="2"><path d="M20,2 L20,12 M10,20 L2,20 M20,38 L20,28 M30,20 L38,20" transform="rotate(90 20 20)"/></g></svg>`,
        ],
        correctAnswer: "A",
        explanation: "The object rotates 45 degrees clockwise at each step. The last position was 135 degrees. The next rotation is 135 + 45 = 180 degrees.",
      },
    ],
    "Test 2": [],
    "Test 3": [],
    "Test 4": [],
    "Test 5": [],
  },
  "Verbal Reasoning": {
    "Test 1": [
      {
        question: `Based on the passage, which of the following statements is true?`,
        preamble: VERBAL_PASSAGES.TEST1_P1,
        options: [
          "Powered flight in birds evolved from tree dwelling dinosaurs.",
          "The evolution of powered flight in birds has been conclusively verified.",
          "Birds are closely related to dinosaurs, but are not dinosaurs themselves.",
          "Birds share brooding behaviours with other feathered dinosaurs."
        ],
        correctAnswer: "Birds share brooding behaviours with other feathered dinosaurs.",
        explanation: "The passage states that 'Fossil evidence demonstrates similarities between birds and other feathered dinosaurs, including... similar brooding behaviours.'"
      },
      {
        question: "Based on the passage, which of the following statements is false?",
        preamble: VERBAL_PASSAGES.TEST1_P1,
        options: [
          "The dinosaurian lineage of birds is not disputed.",
          "Birds were discovered to be related to dinosaurs in the 19th century.",
          "The evolution of powered flight in birds is not debated.",
          "Birds have hollow bones, similar to other feathered dinosaurs."
        ],
        correctAnswer: "The evolution of powered flight in birds is not debated.",
        explanation: "The passage explicitly states that 'the evolution of powered flight in birds is still debated.'"
      },
      {
        question: "What are the two theories of flight evolution in birds mentioned in the passage?",
        preamble: VERBAL_PASSAGES.TEST1_P1,
        options: [
          "The 'up-down' and 'down-up' theories.",
          "The 'ground-up' and 'trees-down' theories.",
          "The 'aquatic-up' and 'land-down' theories.",
          "The 'gliding' and 'flapping' theories."
        ],
        correctAnswer: "The 'ground-up' and 'trees-down' theories.",
        explanation: "The passage clearly lists them: 'Two theories of flight in birds are the “ground-up” theory, and the “trees-down” theory.'"
      },
      {
        question: "According to the passage, the current scientific consensus is that birds are:",
        preamble: VERBAL_PASSAGES.TEST1_P1,
        options: [
          "Descendants of a separate lineage from dinosaurs.",
          "A type of gliding mammal.",
          "Dinosaurs themselves.",
          "Only distantly related to dinosaurs."
        ],
        correctAnswer: "Dinosaurs themselves.",
        explanation: "The passage states, '...the current scientific consensus is that birds were, and always have been dinosaurs themselves.'"
      },
      {
        question: "Which of the following would not be considered a feral cat?",
        preamble: VERBAL_PASSAGES.TEST1_P2,
        options: [
          "A domestic cat that was raised in the wild.",
          "A cat that has not experienced significant human contact.",
          "A pet cat which became nomadic.",
          "A cat which initially shows hostility towards humans."
        ],
        correctAnswer: "A pet cat which became nomadic.",
        explanation: "The passage defines a stray cat, not a feral cat, as one that was 'previously pets which became nomadic.'"
      },
       {
        question: "Based on the passage, feral cats may cause extinctions of which of the following?",
        preamble: VERBAL_PASSAGES.TEST1_P2,
        options: [
          "Ground nesting birds.",
          "Small native mammals.",
          "Amphibian species.",
          "All of the above."
        ],
        correctAnswer: "All of the above.",
        explanation: "The passage lists all three: 'Ground nesting birds, small native mammals and even amphibian species are often impacted... and have led to extinctions...'"
      },
      {
        question: "What is the primary difference between a feral cat and a stray cat?",
        preamble: VERBAL_PASSAGES.TEST1_P2,
        options: [
          "Feral cats are friendly, while stray cats are hostile.",
          "There is no difference.",
          "Feral cats were raised in the wild, while stray cats were former pets.",
          "Stray cats are invasive, while feral cats are not."
        ],
        correctAnswer: "Feral cats were raised in the wild, while stray cats were former pets.",
        explanation: "The passage distinguishes them: 'A feral cat is a domestic cat that was raised in the wild... Feral cats differ from stray cats, in that strays were previously pets...'"
      },
      {
        question: "Why are feral cats often particularly invasive on insular islands?",
        preamble: VERBAL_PASSAGES.TEST1_P2,
        options: [
          "They are accustomed to defending against local species.",
          "They have many natural predators on islands.",
          "They have few natural predators on islands.",
          "They do not prey on local species on islands."
        ],
        correctAnswer: "They have few natural predators on islands.",
        explanation: "The passage states, 'Non-indigenous feral cats often have few natural predators, and prey on local species unaccustomed to defending against cats.'"
      },
       {
        question: "The parable of the broken window illustrates that:",
        preamble: VERBAL_PASSAGES.TEST1_P3,
        options: [
          "Money spent due to destruction does result in a benefit to society.",
          "Job creation due to destruction does not benefit the economy.",
          "Destruction of property has no impact on economic activity.",
          "Money spent due to destruction does not result in a benefit to society."
        ],
        correctAnswer: "Money spent due to destruction does not result in a benefit to society.",
        explanation: "The first sentence clearly states the parable 'is a concept used to illustrate the fact that money spent due to destruction does not result in a benefit to society.'"
      },
      {
        question: "Which of the following is not highlighted by the glazier’s fallacy?",
        preamble: VERBAL_PASSAGES.TEST1_P3,
        options: [
          "Destruction of property impacts economic activity in unseen ways.",
          "Destruction of property impacts economic activity in ignored ways.",
          "More obvious economic effects of destruction are frequently overshadowed.",
          "Tradespeople would be unemployed if windows never broke."
        ],
        correctAnswer: "Tradespeople would be unemployed if windows never broke.",
        explanation: "The passage suggests the opposite: 'if windows never broke, those tradespeople would be free to contribute towards the economy in other occupations.'"
      },
      {
        question: "The 'glazier's fallacy' is another name for what concept?",
        preamble: VERBAL_PASSAGES.TEST1_P3,
        options: [
          "The paradox of thrift.",
          "Moravec's paradox.",
          "The parable of the broken window.",
          "The theory of economic growth."
        ],
        correctAnswer: "The parable of the broken window.",
        explanation: "The first sentence of the passage states: 'The parable of the broken window, also known as the glazier’s fallacy...'"
      },
      {
        question: "The passage suggests that the money spent on repairing the window could have been used for what, had the window not been broken?",
        preamble: VERBAL_PASSAGES.TEST1_P3,
        options: [
          "It could have been saved with no economic impact.",
          "It would not have existed.",
          "It could have contributed elsewhere to the economy.",
          "It would have been spent on breaking more windows."
        ],
        correctAnswer: "It could have contributed elsewhere to the economy.",
        explanation: "The passage says, '...had the window not been broken, the money spent repairing it could have contributed elsewhere to the economy.'"
      },
       {
        question: "Which of the following does not result from excessive saving, according to the paradox of thrift?",
        preamble: VERBAL_PASSAGES.TEST1_P4,
        options: [
          "Aggregate demand falls.",
          "Lowered economic growth.",
          "Increased job security.",
          "Reduced salaries."
        ],
        correctAnswer: "Increased job security.",
        explanation: "The passage lists 'reductions in salary, job security and interest on savings' as negative impacts, so increased job security is incorrect."
      },
       {
        question: "Which of the following is a potential argument against the paradox of thrift?",
        preamble: VERBAL_PASSAGES.TEST1_P4,
        options: [
          "Savings in savings accounts are not used to stimulate the economy.",
          "Excessive saving encourages further excessive saving.",
          "Excessive saving negatively impacts both savers and the economy.",
          "Savings held in savings accounts represent loanable capital for banks."
        ],
        correctAnswer: "Savings held in savings accounts represent loanable capital for banks.",
        explanation: "The final sentence presents the counter-argument: 'it could be argued that savings held in savings accounts represent loanable capital, which banks could use to stimulate the economy...'"
      },
      {
        question: "Who popularized the concept of the paradox of thrift?",
        preamble: VERBAL_PASSAGES.TEST1_P4,
        options: [
          "Adam Smith",
          "John Keynes",
          "Moravec",
          "The Glazier"
        ],
        correctAnswer: "John Keynes",
        explanation: "The passage begins, 'The paradox of thrift, as popularised by John Keynes...'"
      },
      {
        question: "What constitutes the 'vicious cycle' described in the paradox of thrift?",
        preamble: VERBAL_PASSAGES.TEST1_P4,
        options: [
          "Spending leads to inflation, which leads to more spending.",
          "Reduced growth leads to lower salaries, which leads to less saving.",
          "Excessive saving leads to reduced economic growth, which encourages more saving.",
          "Lending leads to investment, which leads to economic recession."
        ],
        correctAnswer: "Excessive saving leads to reduced economic growth, which encourages more saving.",
        explanation: "The passage describes it as: 'This excessive saving results in reduced economic growth, which in turn encourages further excessive saving, causing a vicious cycle.'"
      },
       {
        question: "Moravec’s paradox implies that:",
        preamble: VERBAL_PASSAGES.TEST1_P5,
        options: [
          "Simple occupations will be usurped by artificial intelligences first.",
          "Advanced professions will be usurped by artificial intelligences first.",
          "Artificial intelligences require vast computational resources for advanced reasoning.",
          "Artificial intelligences cannot calculate statistics or play chess."
        ],
        correctAnswer: "Advanced professions will be usurped by artificial intelligences first.",
        explanation: "The last sentence states that 'Moravec’s paradox implies that advanced professions will be usurped first, not the simple or routine occupations.'"
      },
       {
        question: "Which of the following is considered computationally complex by artificial intelligence researchers?",
        preamble: VERBAL_PASSAGES.TEST1_P5,
        options: [
          "Advanced reasoning.",
          "Calculating statistics.",
          "Playing chess.",
          "Recognising faces."
        ],
        correctAnswer: "Recognising faces.",
        explanation: "The passage lists advanced reasoning, calculating statistics, and playing chess as easy for AI, but states that 'extremely basic activities, such as recognising faces or walking up a set of stairs requires vast computational resources.'"
      },
      {
        question: "According to the passage, which activity is considered very easy for artificial intelligences to accomplish?",
        preamble: VERBAL_PASSAGES.TEST1_P5,
        options: [
          "Walking up a set of stairs.",
          "Playing chess.",
          "Recognising faces.",
          "Basic sensory-motor skills."
        ],
        correctAnswer: "Playing chess.",
        explanation: "The passage states, 'Activities considered complex by human standards, such as calculating statistics and playing chess are very easily accomplished by artificial intelligences.'"
      },
      {
        question: "Moravec's paradox is described as a discovery by researchers in which field?",
        preamble: VERBAL_PASSAGES.TEST1_P5,
        options: [
          "Robotics fiction.",
          "Human psychology.",
          "Artificial intelligence.",
          "Computational economics."
        ],
        correctAnswer: "Artificial intelligence.",
        explanation: "The passage introduces it as a 'discovery by artificial intelligence researchers'."
      }
    ],
    "Test 2": [
        {
            question: "Which of the following is mentioned as a potential cause of work-related stress?",
            preamble: VERBAL_PASSAGES.TEST2_P1,
            options: ["Sufficient time for relaxation", "Good relationships with colleagues", "Long hours", "High job security"],
            correctAnswer: "Long hours",
            explanation: "The passage states that work-related stress 'can be caused by poor working conditions, long hours, relationship problems with colleagues, or lack of job security.'"
        },
        {
            question: "What is an emotional problem that can result from work-related stress, according to the passage?",
            preamble: VERBAL_PASSAGES.TEST2_P1,
            options: ["Headaches", "Muscular tension", "Irritability", "Sweating"],
            correctAnswer: "Irritability",
            explanation: "The passage lists 'irritability' as one of the emotional problems resulting from stress."
        },
        {
            question: "According to recent surveys, what fraction of the UK working population described their job as very stressful?",
            preamble: VERBAL_PASSAGES.TEST2_P1,
            options: ["One in six", "Thirty percent", "One in three", "Half"],
            correctAnswer: "One in six",
            explanation: "The last sentence states, '...one in six of the UK working population said their job is very stressful...'"
        },
        {
            question: "What is the name of the non-chemical procedure tested by Dr. Jennifer West?",
            preamble: VERBAL_PASSAGES.TEST2_P2,
            options: ["Chemotherapy", "Radiotherapy", "Photothermal Ablation", "Nanoparticle Injection"],
            correctAnswer: "Photothermal Ablation",
            explanation: "The passage explicitly says, 'She injected millions of nanoparticles... using a non-chemical procedure known as Photothermal Ablation.'"
        },
        {
            question: "Why do the nanoparticles go straight to the tumours?",
            preamble: VERBAL_PASSAGES.TEST2_P2,
            options: ["They are magnetic", "Tumours have abnormal blood capillaries", "They are guided by a laser", "Healthy tissue repels them"],
            correctAnswer: "Tumours have abnormal blood capillaries",
            explanation: "The passage explains, 'These particles go straight to the tumours because, unlike healthy tissue, tumours have abnormal blood capillaries that will let them through.'"
        },
        {
            question: "What type of light is used in the Photothermal Ablation procedure?",
            preamble: VERBAL_PASSAGES.TEST2_P2,
            options: ["Ultraviolet light", "Visible light", "Infrared light", "X-rays"],
            correctAnswer: "Infrared light",
            explanation: "The passage mentions a 'blast of infrared light is passed down the fibre'."
        },
        {
            question: "What is the primary goal of U3b Networks?",
            preamble: VERBAL_PASSAGES.TEST2_P3,
            options: ["To provide global internet coverage", "To provide cheap, high-speed internet to remote areas in developing countries", "To launch a new telephone company in Rwanda", "To compete with existing internet providers in developed countries"],
            correctAnswer: "To provide cheap, high-speed internet to remote areas in developing countries",
            explanation: "The text states the company 'intends to provide cheap, high-speed internet access to remote areas in developing countries'."
        },
        {
            question: "Why is the U3b project considered less risky than previous similar projects?",
            preamble: VERBAL_PASSAGES.TEST2_P3,
            options: ["It has raised more money from investors", "It uses more advanced satellite technology", "It is more modest and does not aim for global coverage initially", "It is owned by a former national telephone company owner"],
            correctAnswer: "It is more modest and does not aim for global coverage initially",
            explanation: "The passage contrasts U3b with past projects: 'previous projects were over-ambitious and set out to provide global coverage, whereas U3b’s project is far more modest in its optimism...'"
        },
        {
            question: "What does the 'U3b' in U3b Networks stand for?",
            preamble: VERBAL_PASSAGES.TEST2_P3,
            options: ["Under 3 Billion", "Unused 3rd-world Bandwidth", "The underprivileged three billion", "Universal 3rd-generation Broadband"],
            correctAnswer: "The underprivileged three billion",
            explanation: "The first sentence clarifies: 'U3b Networks (U3b being short for the underprivileged three billion who lack internet access)...'"
        },
        {
            question: "How wide is the corridor of service U3b initially plans to cover?",
            preamble: VERBAL_PASSAGES.TEST2_P3,
            options: ["8,000km wide", "100km wide around the equator", "Global coverage", "The entire continent of Africa"],
            correctAnswer: "100km wide around the equator",
            explanation: "The passage states its 'services will be available only to a 100km wide corridor around the equator'."
        },
        {
            question: "Workplace bullying is defined in the passage as:",
            preamble: VERBAL_PASSAGES.TEST2_P4,
            options: ["A disagreement between colleagues", "The abuse of a position of power by one individual over another", "A form of school bullying that happens at work", "Behaviour that is only related to gender, race, or age"],
            correctAnswer: "The abuse of a position of power by one individual over another",
            explanation: "The second sentence of the passage states: 'Workplace bullying is the abuse of a position of power by one individual over another.'"
        },
        {
            question: "Which of the following is described as a less obvious form of workplace bullying?",
            preamble: VERBAL_PASSAGES.TEST2_P4,
            options: ["Violence", "Intimidation", "Deliberately ignoring a fellow worker", "Aggression"],
            correctAnswer: "Deliberately ignoring a fellow worker",
            explanation: "The passage concludes by giving examples: 'This kind of bullying ranges from violence to less obvious actions like deliberately ignoring a fellow worker.'"
        },
        {
            question: "How many days of lost output per year are attributed to workplace bullying in the UK?",
            preamble: VERBAL_PASSAGES.TEST2_P4,
            options: ["6 billion", "19,000", "Nearly 19 million", "An unknown number"],
            correctAnswer: "Nearly 19 million",
            explanation: "The passage states that workplace bullying 'results in nearly 19 million days of lost output per year'."
        },
        {
            question: "What did the Phoenix Mars Lander's photos initially reveal in the ditch it dug?",
            preamble: VERBAL_PASSAGES.TEST2_P5,
            options: ["Flowing water", "Traces of salt", "Solid carbon dioxide", "Small patches of bright material"],
            correctAnswer: "Small patches of bright material",
            explanation: "The text says, 'When it dug a ditch in the planet’s surface, photos revealed small patches of bright material.'"
        },
        {
            question: "Why do scientists believe the patches were water ice?",
            preamble: VERBAL_PASSAGES.TEST2_P5,
            options: ["Because they disappeared after a few days", "Because Mars is known to have ice caps", "Because the robot's sensors confirmed it", "Because they tasted salty"],
            correctAnswer: "Because they disappeared after a few days",
            explanation: "The passage explains the reasoning: 'Four days later those patches had disappeared, causing scientists to speculate that they were water ice... which vaporised when exposed to the air.' It further rules out salt and solid CO2."
        },
        {
            question: "What is the name of the robot that landed on Mars in 2008?",
            preamble: VERBAL_PASSAGES.TEST2_P5,
            options: ["Curiosity", "Perseverance", "The Phoenix Mars Lander", "Spirit"],
            correctAnswer: "The Phoenix Mars Lander",
            explanation: "The passage states, 'The Phoenix Mars Lander robot landed on the plains of Mars on May 25th 2008...'"
        },
        {
            question: "Scientists insisted the patches were not salt because:",
            preamble: VERBAL_PASSAGES.TEST2_P5,
            options: ["They wouldn't have vaporised", "They would have melted", "They wouldn't have disappeared", "They would have been a different color"],
            correctAnswer: "They wouldn't have disappeared",
            explanation: "The last sentence says, 'Scientists insisted that if the patches had been salt, they wouldn't have disappeared...'"
        },
        {
            question: "Who is NOT entitled to the national minimum wage in the UK, according to the passage?",
            preamble: VERBAL_PASSAGES.TEST2_P6,
            options: ["Workers over 22 years of age", "Workers in any kind of business", "Genuinely self-employed individuals", "Younger workers"],
            correctAnswer: "Genuinely self-employed individuals",
            explanation: "The passage lists several groups not entitled to the minimum wage, including 'the genuinely self-employed'."
        },
        {
            question: "What body is responsible for recommending the national minimum wage rate to the government?",
            preamble: VERBAL_PASSAGES.TEST2_P6,
            options: ["The Agricultural Wages Board", "The UK Government", "The Low Pay Commission (LPC)", "Individual businesses"],
            correctAnswer: "The Low Pay Commission (LPC)",
            explanation: "The passage states, 'An independent body called the Low Pay Commission (LPC) each year reviews this rate and passes their recommendation to the government...'"
        },
        {
            question: "Which group of workers has a separate minimum rate of pay set by a different board?",
            preamble: VERBAL_PASSAGES.TEST2_P6,
            options: ["Apprentices", "Voluntary workers", "Agricultural workers", "Armed service personnel"],
            correctAnswer: "Agricultural workers",
            explanation: "The passage concludes, 'Also agricultural workers have a separate minimum rate of pay set by the Agricultural Wages Board.'"
        }
    ],
    "Test 3": [
        {
            question: "According to the passage, what is an effective proactive approach for a leader to handle team-member conflicts?",
            preamble: VERBAL_PASSAGES.TEST3_P1,
            options: ["Wait for a problem to develop before acting.", "Lead by example with reference to clear guidelines.", "Impose obligations externally on the team.", "Use a rigid communication style."],
            correctAnswer: "Lead by example with reference to clear guidelines.",
            explanation: "The passage suggests to 'take a proactive approach in heading it off with reference to clearly laid out guidelines.'"
        },
        {
            question: "What is the benefit of giving a team a sense of personal involvement in the organisation's mission?",
            preamble: VERBAL_PASSAGES.TEST3_P1,
            options: ["It makes them feel a sense of externally imposed obligation.", "It decreases their sense of personal control.", "It encourages them to internalise the needs of the group.", "It removes the need for a flexible communication approach."],
            correctAnswer: "It encourages them to internalise the needs of the group.",
            explanation: "The text states this approach 'encourages them to feel part of the organisation's mission, internalising the needs of the group...'"
        },
        {
            question: "To achieve team involvement, a manager must have a good understanding of what?",
            preamble: VERBAL_PASSAGES.TEST3_P1,
            options: ["Financial forecasting.", "The way individual people communicate.", "The company's stock price.", "The competitors' strategies."],
            correctAnswer: "The way individual people communicate.",
            explanation: "The passage concludes, 'To achieve this, a manager must have a good understanding of the way individual people communicate...'"
        },
        {
            question: "For an effective PR campaign, what is the most important type of information a client should disclose?",
            preamble: VERBAL_PASSAGES.TEST3_P2,
            options: ["Only the company's successes.", "The company's history and goals.", "Any potentially problematic issues.", "The schedule for copy approval."],
            correctAnswer: "Any potentially problematic issues.",
            explanation: "The passage emphasizes, 'It is especially important to disclose any potentially problematic issues.'"
        },
        {
            question: "What is key to the success of a PR campaign when new developments arise?",
            preamble: VERBAL_PASSAGES.TEST3_P2,
            options: ["Waiting until the next scheduled meeting to discuss them.", "Briefing the PR officer as soon as possible.", "Ensuring the new developments are kept confidential.", "Letting the PR officer find out through public channels."],
            correctAnswer: "Briefing the PR officer as soon as possible.",
            explanation: "'If new developments do arise, the PR officer should be fully briefed as soon as possible.'"
        },
        {
            question: "What is key to the success of a campaign when opportunities arise?",
            preamble: VERBAL_PASSAGES.TEST3_P2,
            options: ["Careful planning", "Ignoring them", "Seizing them", "Delegating them"],
            correctAnswer: "Seizing them",
            explanation: "The last sentence says, 'Seizing opportunities when they arise is key to the success of the campaign.'"
        },
        {
            question: "How can orientation and value-formation training motivate new staff recruits?",
            preamble: VERBAL_PASSAGES.TEST3_P3,
            options: ["By showing them that financial security is a slow process.", "By emphasizing the risks of innovative business approaches.", "By creating an impression that missing opportunities would be catastrophic.", "By discouraging them from working long hours."],
            correctAnswer: "By creating an impression that missing opportunities would be catastrophic.",
            explanation: "The passage mentions training should combine the idea of rapid financial security with 'the impression that to miss out on opportunities for such rapid economic and social advancement would be at best unwise and at worst catastrophic.'"
        },
        {
            question: "What is the secret to success in business, according to the passage?",
            preamble: VERBAL_PASSAGES.TEST3_P3,
            options: ["A top-down management approach.", "Entrepreneurial spirit at all levels of the company.", "Minimizing the financial success of employees.", "Avoiding orientation and value-formation training."],
            correctAnswer: "Entrepreneurial spirit at all levels of the company.",
            explanation: "The first sentence states, 'The secret to success in business is entrepreneurial spirit at all levels of the company.'"
        },
        {
            question: "The passage suggests employees who are entrepreneurs in their own right are more what?",
            preamble: VERBAL_PASSAGES.TEST3_P3,
            options: ["Likely to leave the company.", "Resistant to training.", "Motivated.", "Difficult to manage."],
            correctAnswer: "Motivated.",
            explanation: "'Employees who are identified as entrepreneurs in their own right are more motivated...'"
        },
        {
            question: "What tactics are described as unlikely to impress a boss if promotion is the goal?",
            preamble: VERBAL_PASSAGES.TEST3_P4,
            options: ["Requesting feedback and accepting criticism.", "Clarifying instructions and anticipating needs.", "Artificial flattery or excessive deference.", "Understanding the boss's personal goals."],
            correctAnswer: "Artificial flattery or excessive deference.",
            explanation: "'On the other hand, artificial flattery or excessive deference are tactics unlikely to impress if promotion is the goal...'"
        },
        {
            question: "What should a good employee demonstrate to be considered for promotion?",
            preamble: VERBAL_PASSAGES.TEST3_P4,
            options: ["The ability to follow instructions without question.", "The potential to be an equally effective boss.", "A willingness to engage in artificial flattery.", "A lack of understanding of the company's goals."],
            correctAnswer: "The potential to be an equally effective boss.",
            explanation: "...a good employee should demonstrate the potential to be an equally effective boss."
        },
        {
            question: "What is described as being crucial for ambitious employees?",
            preamble: VERBAL_PASSAGES.TEST3_P4,
            options: ["A bad relationship with their boss.", "A good relationship with their immediate boss.", "Avoiding communication.", "Ignoring feedback."],
            correctAnswer: "A good relationship with their immediate boss.",
            explanation: "The first sentence states, 'For ambitious employees, a good relationship with their immediate boss is crucial.'"
        },
        {
            question: "According to the passage, a salesperson's confidence in a product partly depends on what?",
            preamble: VERBAL_PASSAGES.TEST3_P5,
            options: ["The product's price.", "Confidence in the integrity and competence of the manufacturers.", "The effectiveness of the sales pitch.", "The company's advertising budget."],
            correctAnswer: "Confidence in the integrity and competence of the manufacturers.",
            explanation: "'Confidence in a product depends in part on confidence in the integrity, competence, and commitment of those who manufacture and distribute that product.'"
        },
        {
            question: "What information can help a salesperson form an effective sales pitch?",
            preamble: VERBAL_PASSAGES.TEST3_P5,
            options: ["Only the product's features.", "The company's history, development, and reputation.", "The personal hobbies of the key individuals.", "The details of competing products."],
            correctAnswer: "The company's history, development, and reputation.",
            explanation: "The passage suggests knowing 'the history and development of the company, as well as being aware of its present reputation' can 'help to form the basis of an effective sales pitch.'"
        },
        {
            question: "Besides knowing the company's history, salespeople should also familiarize themselves with what?",
            preamble: VERBAL_PASSAGES.TEST3_P5,
            options: ["The company's cafeteria menu.", "The principal personalities behind the company.", "The client's personal life.", "The company's stock performance."],
            correctAnswer: "The principal personalities behind the company.",
            explanation: "'Salespeople should therefore familiarise themselves with the principal personalities behind a company...'"
        },
        {
            question: "Why might owners of small businesses feel they can be flexible about their code of ethics?",
            preamble: VERBAL_PASSAGES.TEST3_P6,
            options: ["Because they are watched closely by the media.", "Because they feel anonymous in an environment of multinational conglomerates.", "Because ethical practices are not a primary concern for any business.", "Because their employees cannot draw attention to their behaviour."],
            correctAnswer: "Because they feel anonymous in an environment of multinational conglomerates.",
            explanation: "'...owners of small businesses may feel anonymous enough to become flexible about their code of ethics.'"
        },
        {
            question: "What does the passage say about the speed at which unethical practices can become public knowledge?",
            preamble: VERBAL_PASSAGES.TEST3_P6,
            options: ["It takes several years.", "It is a slow process.", "It can happen overnight.", "It rarely happens."],
            correctAnswer: "It can happen overnight.",
            explanation: "'...unethical practices can become a matter of public knowledge overnight, with devastating consequences.'"
        },
        {
            question: "What is a helpful starting point for creating an advertising strategy for a new business?",
            preamble: VERBAL_PASSAGES.TEST3_P7,
            options: ["Designing a website.", "Analyzing competitors' advertising.", "Promoting the website to draw traffic.", "Embracing the latest technology."],
            correctAnswer: "Analyzing competitors' advertising.",
            explanation: "'...a helpful starting point for which is an analysis of the advertising currently being used by competitors in the same line of business.'"
        },
        {
            question: "What does a well-designed and widely promoted website assure potential clients of?",
            preamble: VERBAL_PASSAGES.TEST3_P7,
            options: ["That the company has the lowest prices.", "That the company is old and established.", "That the company has a forward-thinking and enterprising outlook.", "That the company avoids using new technology."],
            correctAnswer: "That the company has a forward-thinking and enterprising outlook.",
            explanation: "This 'assures potential clients that the company has a forward-thinking, enterprising outlook, and is willing to embrace as well as exploit the latest technological developments.'"
        },
        {
            question: "What two qualities should a well-designed website ideally combine?",
            preamble: VERBAL_PASSAGES.TEST3_P7,
            options: ["A complex and a simple design.", "A professional appearance and user-friendly functionality.", "Details of advertising and a low budget.", "High traffic and a private server."],
            correctAnswer: "A professional appearance and user-friendly functionality.",
            explanation: "'A well-designed website should ideally combine a professional appearance with user-friendly functionality...'"
        }
    ],
    "Test 4": [
        {
            question: "What is a key difference between open-source software and freeware?",
            preamble: VERBAL_PASSAGES.TEST4_P1,
            options: ["Open-source software is never free.", "Freeware always provides access to the source code.", "Open-source software's source code must be available to the public.", "Freeware allows anyone to modify it."],
            correctAnswer: "Open-source software's source code must be available to the public.",
            explanation: "The passage states a criteria for open-source is 'that the source code must be available to the general public via an open-source license'."
        },
        {
            question: "How do manufacturers of commercial software typically retain control over their product?",
            preamble: VERBAL_PASSAGES.TEST4_P1,
            options: ["By making the source code publicly available.", "By only making a compiled, ready-to-run version available.", "By not charging a license fee.", "By offering no technical support."],
            correctAnswer: "By only making a compiled, ready-to-run version available.",
            explanation: "The passage says, 'By only making a compiled, ready-to-run version available, software manufacturers retain full control over their product...'"
        },
        {
            question: "How can open-source software be commercially viable without charging license fees?",
            preamble: VERBAL_PASSAGES.TEST4_P1,
            options: ["It cannot be commercially viable.", "By protecting its source code.", "By charging for installation, training, and technical support.", "By providing a warranty for free."],
            correctAnswer: "By charging for installation, training, and technical support.",
            explanation: "'Developers charge for installation, training and technical support. Alternatively, licenses for add-ons and additional software may be sold.'"
        },
        {
            question: "What must happen to any modifications made to open-source software?",
            preamble: VERBAL_PASSAGES.TEST4_P1,
            options: ["They must be kept private.", "They must be sold for a profit.", "They must be distributed under the same terms as the original software.", "They must be approved by the original creators."],
            correctAnswer: "They must be distributed under the same terms as the original software.",
            explanation: "The passage states, 'Any modifications made must also be distributed under the same terms as the original software.'"
        },
        {
            question: "What do proponents of the open-source movement believe is a result of its collaborative development methodology?",
            preamble: VERBAL_PASSAGES.TEST4_P1,
            options: ["Slower improvements and less reliable software.", "Higher license fees for end-users.", "Quicker improvements and easily adapted software.", "Less security and more bugs."],
            correctAnswer: "Quicker improvements and easily adapted software.",
            explanation: "'Proponents of the open-source movement believe this collaborative development methodology results in quicker improvements and software that can be easily adapted to users’ needs.'"
        },
        {
            question: "The Ring of Fire is characterized by:",
            preamble: VERBAL_PASSAGES.TEST4_P2,
            options: ["A lack of seismic and volcanic activity.", "Frequent seismic and volcanic activity.", "Only a small percentage of the world's earthquakes.", "The absence of volcanoes."],
            correctAnswer: "Frequent seismic and volcanic activity.",
            explanation: "The first sentence defines it as 'an area of frequent seismic and volcanic activity'."
        },
        {
            question: "According to plate tectonics, when do volcanoes occur?",
            preamble: VERBAL_PASSAGES.TEST4_P2,
            options: ["When two plates move away from each other.", "When plates that are pushing against each other suddenly slip.", "Only when two adjacent plates converge and one slides under the other.", "In areas with no tectonic plates."],
            correctAnswer: "Only when two adjacent plates converge and one slides under the other.",
            explanation: "The passage explains, 'Volcanoes occur only when two adjacent plates converge and one plate slides under the other, a process known as subduction.'"
        },
        {
            question: "What percentage of the world's volcanoes are located in the Ring of Fire?",
            preamble: VERBAL_PASSAGES.TEST4_P2,
            options: ["90%", "452", "75%", "40,000"],
            correctAnswer: "75%",
            explanation: "The passage states, 'There are an estimated 452 volcanoes – 75% of the world’s total – located in this 40,000 km belt.'"
        },
        {
            question: "When was the geological theory of plate tectonics first expounded?",
            preamble: VERBAL_PASSAGES.TEST4_P2,
            options: ["In the 19th century.", "In the 1960s.", "In 1990.", "The passage does not say."],
            correctAnswer: "In the 1960s.",
            explanation: "The passage refers to plate tectonics as 'a unifying geological theory first expounded in the 1960s.'"
        },
        {
            question: "According to the passage, earthquakes are caused when tectonic plates do what?",
            preamble: VERBAL_PASSAGES.TEST4_P2,
            options: ["Converge and one slides under the other.", "Suddenly slip while pushing against each other.", "Change size over time.", "Move deeper into the Earth and melt."],
            correctAnswer: "Suddenly slip while pushing against each other.",
            explanation: "'Earthquakes are caused when plates that are pushing against each other suddenly slip.'"
        },
        {
            question: "What was the purpose of the 1986 moratorium on commercial whaling imposed by the IWC?",
            preamble: VERBAL_PASSAGES.TEST4_P3,
            options: ["To oversee the development of the whaling industry.", "To promote the cultural heritage of whaling.", "To prevent the extinction of endangered whale species.", "To increase the demand for whale meat."],
            correctAnswer: "To prevent the extinction of endangered whale species.",
            explanation: "'In 1986, the IWC imposed a moratorium on commercial whaling to prevent the extinction of endangered whale species.'"
        },
        {
            question: "What is an argument used by anti-whaling activists?",
            preamble: VERBAL_PASSAGES.TEST4_P3,
            options: ["Whale stocks have fully recovered.", "Whaling is part of cultural heritage.", "Whales' intelligence gives them intrinsic value.", "The demand for whale meat has increased."],
            correctAnswer: "Whales' intelligence gives them intrinsic value.",
            explanation: "The passage says, 'They argue that whales remain vulnerable, and that whales’ intelligence gives them intrinsic value.'"
        },
        {
            question: "What new industry could be threatened by an end to whaling restrictions?",
            preamble: VERBAL_PASSAGES.TEST4_P3,
            options: ["The whale oil industry.", "The sports fishing industry.", "The whale-watching tourist industry.", "The industrial shipping industry."],
            correctAnswer: "The whale-watching tourist industry.",
            explanation: "'...whale-watching has become a popular tourist activity, and an end to restrictions could threaten this profitable industry.'"
        },
        {
            question: "When was the International Whaling Commission (IWC) established?",
            preamble: VERBAL_PASSAGES.TEST4_P3,
            options: ["1986", "In the 18th century", "1946", "In the mid-twentieth century"],
            correctAnswer: "1946",
            explanation: "The passage states, 'The International Whaling Commission (IWC) was established in 1946...'"
        },
        {
            question: "What percentage of vote does the IWC require to overturn the whaling ban?",
            preamble: VERBAL_PASSAGES.TEST4_P3,
            options: ["50%", "100%", "A simple majority", "75%"],
            correctAnswer: "75%",
            explanation: "'So intense is the whaling debate that the IWC, which requires a 75% vote to overturn the ban, has reached a stalemate.'"
        },
        {
            question: "What threat to the Great Barrier Reef is mentioned in the passage?",
            preamble: VERBAL_PASSAGES.TEST4_P4,
            options: ["The slow growth of coral polyps.", "The effects of climate change on water temperature.", "The high number of Aboriginal Australian visitors.", "The presence of too many endemic creatures."],
            correctAnswer: "The effects of climate change on water temperature.",
            explanation: "The passage says, 'Unfortunately the fragility of the reef’s ecosystem is now threatened by the effects of climate change on the temperature of the water...'"
        },
        {
            question: "What has caused coral bleaching over the last decade?",
            preamble: VERBAL_PASSAGES.TEST4_P4,
            options: ["Over-visitation by tourists.", "The slow growth of coral.", "Sea pollution caused by farm runoff.", "The creation of new islands."],
            correctAnswer: "Sea pollution caused by farm runoff.",
            explanation: "'Over the last decade sea pollution caused by farm runoff has caused coral bleaching...'"
        },
        {
            question: "Where are fringing and lagoonal reefs most commonly found in the Great Barrier Reef system?",
            preamble: VERBAL_PASSAGES.TEST4_P4,
            options: ["In the northern section.", "In the middle section.", "In the southern sections.", "They are not found in the reef system."],
            correctAnswer: "In the southern sections.",
            explanation: "'The most common occurrences of fringing and lagoonal reefs are in the southern sections of the reef.'"
        },
        {
            question: "For how long have Aboriginal Australians visited the Great Barrier Reef?",
            preamble: VERBAL_PASSAGES.TEST4_P4,
            options: ["Over two million years", "Over 40,000 years", "Since half a million years ago", "For the last decade"],
            correctAnswer: "Over 40,000 years",
            explanation: "'...the Great Barrier Reef has been visited by Aboriginal Australians for over 40,000 years...'"
        },
        {
            question: "What type of reefs are most likely to be found in the middle section of the reef system?",
            preamble: VERBAL_PASSAGES.TEST4_P4,
            options: ["Deltaic reefs", "Ribbon reefs", "Fringing reefs", "Cresentic reefs"],
            correctAnswer: "Cresentic reefs",
            explanation: "'In the middle section you are most likely to find cresentic reefs...'"
        }
    ],
    "Test 5": [
        {
            question: "How does crude oil from oil sands differ from crude oil from traditional wells?",
            preamble: VERBAL_PASSAGES.TEST5_P1,
            options: ["It is a free-flowing mixture of hydrocarbons.", "It is a highly viscous form of petroleum.", "It is a cleaner source of fuel.", "It generates fewer greenhouse gases during extraction."],
            correctAnswer: "It is a highly viscous form of petroleum.",
            explanation: "The passage contrasts traditional oil which is 'a free-flowing mixture' with oil from sands which 'yield a highly viscous form of petroleum.'"
        },
        {
            question: "What is an argument used by proponents of oil sands development?",
            preamble: VERBAL_PASSAGES.TEST5_P1,
            options: ["It generates fewer greenhouse gases than conventional oil.", "It has no impact on the local environment.", "Land has already been reclaimed following development.", "It does not create toxic waste ponds."],
            correctAnswer: "Land has already been reclaimed following development.",
            explanation: "'Proponents of oil sands development point to the land that has already been reclaimed following oil sands development.'"
        },
        {
            question: "In which two locations are oil sands most commonly found?",
            preamble: VERBAL_PASSAGES.TEST5_P1,
            options: ["The North Sea and Alaska", "Saudi Arabia and Russia", "The United States and Mexico", "Venezuela’s Oroco Basin and Alberta, Canada"],
            correctAnswer: "Venezuela’s Oroco Basin and Alberta, Canada",
            explanation: "The first sentence says, 'Oil sands are most commonly found in Venezuela’s Oroco Basin and Alberta, Canada.'"
        },
        {
            question: "How many times more greenhouse gases are generated from oil sands extraction compared to conventional oil?",
            preamble: VERBAL_PASSAGES.TEST5_P1,
            options: ["Two times", "Four times", "Ten times", "The same amount"],
            correctAnswer: "Four times",
            explanation: "'Compared to conventional oil, four times the amount of greenhouse gases are generated from the extraction of bitumen from oil sands.'"
        },
        {
            question: "Tailing ponds of toxic waste are created when tar sands are washed with what?",
            preamble: VERBAL_PASSAGES.TEST5_P1,
            options: ["Acid", "Solvents", "Water", "Oil"],
            correctAnswer: "Water",
            explanation: "'Tailing ponds of toxic waste are created whenever the tar sands are washed with water.'"
        },
        {
            question: "Why do many sufferers of Myalgic Encephalomyelitis object to the name Chronic Fatigue Syndrome (CFS)?",
            preamble: VERBAL_PASSAGES.TEST5_P2,
            options: ["They believe it does not reflect the severity of the illness.", "They prefer a shorter name.", "The World Health Organisation does not recognize the name.", "Fatigue is not a symptom of the illness."],
            correctAnswer: "They believe it does not reflect the severity of the illness.",
            explanation: "'...many sufferers object to the name CFS on grounds that it is does not reflect the severity of the illness.'"
        },
        {
            question: "What was the outcome of the 2009 study that linked CFS to the XMRV retrovirus?",
            preamble: VERBAL_PASSAGES.TEST5_P2,
            options: ["It was confirmed by further research and led to a cure.", "It was disproven by further research.", "It led to a new diagnostic test for CFS.", "It proved that CFS is a psychiatric condition."],
            correctAnswer: "It was disproven by further research.",
            explanation: "'What at first appeared to be a major scientific breakthrough, however, was disproven by further research – and XMRV is now thought to be a lab contaminant.'"
        },
        {
            question: "Approximately how many people worldwide have CFS?",
            preamble: VERBAL_PASSAGES.TEST5_P2,
            options: ["1 million", "17 million", "100 million", "The number is unknown"],
            correctAnswer: "17 million",
            explanation: "'Although an estimated 17 million people worldwide have CFS...'"
        },
        {
            question: "The World Health Organisation classifies CFS as what type of disease?",
            preamble: VERBAL_PASSAGES.TEST5_P2,
            options: ["Psychiatric", "Viral", "Genetic", "Neurological"],
            correctAnswer: "Neurological",
            explanation: "'Despite the World Health Organisation classifying CFS as a neurological disease...'"
        },
        {
            question: "A diagnostic test for CFS currently...",
            preamble: VERBAL_PASSAGES.TEST5_P2,
            options: ["Is widely available.", "Is based on the XMRV retrovirus.", "Does not exist.", "Is highly controversial."],
            correctAnswer: "Does not exist.",
            explanation: "'...its cause is unknown and a diagnostic test does not exist.'"
        },
        {
            question: "What is one of the most unusual features of REM sleep?",
            preamble: VERBAL_PASSAGES.TEST5_P3,
            options: ["It is a state of full consciousness.", "Most of the body's muscles are paralysed.", "It only occurs once per night.", "People never report dreaming if woken during it."],
            correctAnswer: "Most of the body's muscles are paralysed.",
            explanation: "'One of the most unusual features of this state is that most of the body’s muscles are paralysed.'"
        },
        {
            question: "What does the 'scanning hypothesis' posit?",
            preamble: VERBAL_PASSAGES.TEST5_P3,
            options: ["That dreams become less complex as children age.", "That it is impossible to know when you are dreaming.", "That eyes move during REM sleep in accordance with the direction of gaze in the dream.", "That lucid dreaming is not a real phenomenon."],
            correctAnswer: "That eyes move during REM sleep in accordance with the direction of gaze in the dream.",
            explanation: "The passage states, 'The “scanning hypothesis” posits that eyes move during REM sleep in accordance with the direction of gaze of one’s dream.'"
        },
        {
            question: "What does REM stand for?",
            preamble: VERBAL_PASSAGES.TEST5_P3,
            options: ["Rapid Energy Movement", "Restful Eye Motion", "Rapid Eye Movement", "Real Emotion Memory"],
            correctAnswer: "Rapid Eye Movement",
            explanation: "'Dreaming involves an altered state of consciousness that occurs during periods of REM (rapid eye movement) sleep.'"
        },
        {
            question: "How many times does the REM/non-REM sleep cycle typically repeat itself in a night?",
            preamble: VERBAL_PASSAGES.TEST5_P3,
            options: ["Once", "Twice", "Up to five times", "More than ten times"],
            correctAnswer: "Up to five times",
            explanation: "'...and for this to repeat itself up to five times a night.'"
        },
        {
            question: "People who know they are dreaming are experiencing what?",
            preamble: VERBAL_PASSAGES.TEST5_P3,
            options: ["A non-REM dream", "A lucid dream", "A hallucination", "A memory"],
            correctAnswer: "A lucid dream",
            explanation: "'There are a small number of people, however, who do know when they are experiencing what is called a “lucid” dream.'"
        },
        {
            question: "Which of the following is NOT one of the three main areas of ergonomics?",
            preamble: VERBAL_PASSAGES.TEST5_P4,
            options: ["Physical ergonomics", "Cognitive ergonomics", "Financial ergonomics", "Organisational ergonomics"],
            correctAnswer: "Financial ergonomics",
            explanation: "The passage divides the field into three main areas: 'Physical ergonomics', 'Cognitive ergonomics', and 'Organisational ergonomics'."
        },
        {
            question: "What is the benefit for progressive organisations that improve workplace ergonomics?",
            preamble: VERBAL_PASSAGES.TEST5_P4,
            options: ["Increased sick leave.", "Increased productivity and reduced sick leave.", "Decreased productivity.", "Higher costs for compensation to injured workers."],
            correctAnswer: "Increased productivity and reduced sick leave.",
            explanation: "'The benefit of this strategy is not only increased productivity but also reduced sick leave.'"
        },
        {
            question: "What is the aim of ergonomics?",
            preamble: VERBAL_PASSAGES.TEST5_P4,
            options: ["To make machines more complex.", "To design equipment and environments that best fit users’ physical and psychological needs.", "To increase the cost of workplace equipment.", "To reduce the efficiency of a person using a device."],
            correctAnswer: "To design equipment and environments that best fit users’ physical and psychological needs.",
            explanation: "'The discipline aims to design equipment and environments that best fit users’ physical and psychological needs...'"
        },
        {
            question: "Cognitive ergonomics studies what?",
            preamble: VERBAL_PASSAGES.TEST5_P4,
            options: ["The relationship between human anatomy and physical activity.", "How the physical environment affects health.", "The mental processes involved in humans’ interactions with systems.", "Socio-technical systems, such as team structure."],
            correctAnswer: "The mental processes involved in humans’ interactions with systems.",
            explanation: "'Cognitive ergonomics studies the mental processes involved in humans’ interactions with systems, such as computer interfaces.'"
        },
        {
            question: "In the United States, how much do repetitive strain injuries cost in worker compensation annually?",
            preamble: VERBAL_PASSAGES.TEST5_P4,
            options: ["$20 million", "$2 billion", "$20 billion", "The passage does not say"],
            correctAnswer: "$20 billion",
            explanation: "'In the United States, compensation to workers with repetitive strain injuries costs $20 billion annually.'"
        }
    ],
    "Test 6": [
        {
            question: "What is one reason the Australian government has implemented kangaroo culls?",
            preamble: VERBAL_PASSAGES.TEST6_P1,
            options: ["To boost the kangaroo's status as a national icon.", "To control populations that are threatening the grassland ecosystem.", "To encourage overgrazing and soil erosion.", "Because kangaroos have no natural predators."],
            correctAnswer: "To control populations that are threatening the grassland ecosystem.",
            explanation: "The passage says, 'Although indigenous to Australia, kangaroos are, in some areas, threatening the grassland ecosystem.'"
        },
        {
            question: "What is an alternative to culling favored by protesters?",
            preamble: VERBAL_PASSAGES.TEST6_P1,
            options: ["Encouraging kangaroos to damage wheat crops.", "Ignoring the problem of limited resources.", "Relocating or sterilizing the kangaroos.", "Implementing more culls in different areas."],
            correctAnswer: "Relocating or sterilizing the kangaroos.",
            explanation: "'Instead, they favour the relocation of kangaroos to suitable new habitats, or sterilizing the animals in overpopulated areas.'"
        },
        {
            question: "What is a criticism of relocating kangaroos?",
            preamble: VERBAL_PASSAGES.TEST6_P1,
            options: ["It is an inexpensive undertaking.", "It has an immediate effect on land degradation.", "It would not traumatize the kangaroos.", "It could ultimately threaten the new habitat."],
            correctAnswer: "It could ultimately threaten the new habitat.",
            explanation: "'...critics believe it would potentially traumatize the relocated kangaroos and ultimately threaten the new habitat.'"
        },
        {
            question: "The issue of kangaroo culling is particularly what, due to the animal's status as a national icon?",
            preamble: VERBAL_PASSAGES.TEST6_P1,
            options: ["Uncontroversial", "Emotive", "Economical", "Ignored"],
            correctAnswer: "Emotive",
            explanation: "'The issue is particularly emotive because of the kangaroo’s status as a national icon...'"
        },
        {
            question: "Overgrazing by kangaroos threatens the survival of which rare species?",
            preamble: VERBAL_PASSAGES.TEST6_P1,
            options: ["Certain species of bird", "Certain rare species of lizard", "Small mammals", "Native fish"],
            correctAnswer: "Certain rare species of lizard",
            explanation: "'Overgrazing causes soil erosion thus threatening the survival of certain rare species of lizard.'"
        },
        {
            question: "What is a problem with sterilizing kangaroos as a solution to overpopulation?",
            preamble: VERBAL_PASSAGES.TEST6_P1,
            options: ["It is the preferred method of the government.", "It will have an immediate effect.", "It will not have an immediate effect.", "It is the most humane option available."],
            correctAnswer: "It will not have an immediate effect.",
            explanation: "'Sterilization, however, will not have an immediate effect on the problems of limited resources and land degradation...'"
        },
        {
            question: "Protesters typically oppose the cull on what grounds?",
            preamble: VERBAL_PASSAGES.TEST6_P1,
            options: ["That it is ineffective.", "That it is too expensive.", "That it is inhumane.", "That it damages the ecosystem."],
            correctAnswer: "That it is inhumane.",
            explanation: "'Protesters typically oppose the cull on grounds that it is inhumane.'"
        },
        {
            question: "In overpopulated areas, what are kangaroos damaging due to food scarcity?",
            preamble: VERBAL_PASSAGES.TEST6_P1,
            options: ["Fences", "Water supplies", "Wheat crops", "Native forests"],
            correctAnswer: "Wheat crops",
            explanation: "'...food scarcity is driving kangaroos to damage wheat crops.'"
        },
        {
            question: "Some detractors view the culls as an attack on what?",
            preamble: VERBAL_PASSAGES.TEST6_P1,
            options: ["The environment", "The economy", "Australia's identity", "The tourist industry"],
            correctAnswer: "Australia's identity",
            explanation: "'...with some detractors viewing the culls as an attack on Australia’s identity.'"
        },
        {
            question: "Transporting large numbers of kangaroos is described as what?",
            preamble: VERBAL_PASSAGES.TEST6_P1,
            options: ["A cheap undertaking", "An effective solution", "An expensive undertaking", "A popular idea"],
            correctAnswer: "An expensive undertaking",
            explanation: "'Not only is transporting large numbers of kangaroos an expensive undertaking...'"
        },
        {
            question: "What is the fastest-growing category of waste mentioned in the passage?",
            preamble: VERBAL_PASSAGES.TEST6_P2,
            options: ["Paper", "Glass", "Plastics", "Food waste"],
            correctAnswer: "Plastics",
            explanation: "The first sentence states, 'Plastics represent the fastest-growing category of waste.'"
        },
        {
            question: "What is a downside of shipping Europe's plastic to China for recycling?",
            preamble: VERBAL_PASSAGES.TEST6_P2,
            options: ["It consumes low amounts of energy.", "Working conditions in Chinese factories are excellent.", "The transportation consumes large amounts of energy.", "It is very expensive for China."],
            correctAnswer: "The transportation consumes large amounts of energy.",
            explanation: "'The downside to this is that the transportation consumes large amounts of energy and working conditions in the Chinese processing factories are poor.'"
        },
        {
            question: "What does the passage suggest is a better solution than recycling plastic?",
            preamble: VERBAL_PASSAGES.TEST6_P2,
            options: ["Using more plastic bags and bottles.", "Shipping more plastic to China.", "Reducing plastic proliferation.", "Developing new types of plastic."],
            correctAnswer: "Reducing plastic proliferation.",
            explanation: "The final sentence concludes, 'While recycling plastic may salve the conscience of western consumers, reducing plastic proliferation is a better solution.'"
        },
        {
            question: "What plastic are most shopping bags and bottles made from?",
            preamble: VERBAL_PASSAGES.TEST6_P2,
            options: ["Polyvinyl chloride (PVC)", "Polypropylene (PP)", "Polyethylene terepthalate (PET)", "High-density polyethylene (HDPE)"],
            correctAnswer: "Polyethylene terepthalate (PET)",
            explanation: "'The majority of these bags and bottles are made from polyethylene terepthalate (PET)...'"
        },
        {
            question: "How long does PET take to degrade?",
            preamble: VERBAL_PASSAGES.TEST6_P2,
            options: ["Over 10 years", "Over 100 years", "Over 1,000 years", "It never degrades"],
            correctAnswer: "Over 1,000 years",
            explanation: "'Because PET takes over 1,000 years to degrade...'"
        },
        {
            question: "What makes recycling plastic labour-intensive?",
            preamble: VERBAL_PASSAGES.TEST6_P2,
            options: ["The high value of recycled plastic.", "The requirement to ship it to China.", "Sorting the many different types of plastic.", "The lack of recycling programmes."],
            correctAnswer: "Sorting the many different types of plastic.",
            explanation: "'Firstly, there are many different types of plastic, and sorting them makes recycling labour-intensive.'"
        },
        {
            question: "Why does recycled plastic have a low value?",
            preamble: VERBAL_PASSAGES.TEST6_P2,
            options: ["Because it is easy to sort.", "Because the quality degrades with each reuse.", "Because it is in high demand.", "Because it is shipped from Europe."],
            correctAnswer: "Because the quality degrades with each reuse.",
            explanation: "'Secondly, because the quality of plastic degrades with each reuse, recycled plastic has a low value.'"
        },
        {
            question: "Worldwide, how many plastic shopping bags do consumers use annually?",
            preamble: VERBAL_PASSAGES.TEST6_P2,
            options: ["154 billion", "500 million", "500 billion", "1 trillion"],
            correctAnswer: "500 billion",
            explanation: "'Worldwide consumers use 500 billion plastic shopping bags... annually.'"
        },
        {
            question: "What is PET derived from?",
            preamble: VERBAL_PASSAGES.TEST6_P2,
            options: ["Crude oil", "Natural gas", "Plants", "Recycled paper"],
            correctAnswer: "Crude oil",
            explanation: "'...a plastic derived from crude oil.'"
        },
        {
            question: "Besides energy consumption, what is another negative aspect of shipping plastic to China for processing?",
            preamble: VERBAL_PASSAGES.TEST6_P2,
            options: ["High recycling value", "Strict environmental regulations", "Excellent factory conditions", "Poor working conditions in the factories"],
            correctAnswer: "Poor working conditions in the factories",
            explanation: "'...and working conditions in the Chinese processing factories are poor.'"
        }
    ],
    "Test 7": [
        {
            question: "What change was made to Title IV in 2006?",
            preamble: VERBAL_PASSAGES.TEST7_P1,
            options: ["It banned single-sex schools entirely.", "It allowed single-sex state schools as long as a co-educational alternative is available.", "It made co-educational schools illegal.", "It removed all regulations on sex discrimination in education."],
            correctAnswer: "It allowed single-sex state schools as long as a co-educational alternative is available.",
            explanation: "The passage says the law 'was amended in 2006, allowing for the establishment of single-sex state schools so long as a co-educational alternative is available.'"
        },
        {
            question: "What is a claimed benefit of single-sex schools for girls, according to some American research?",
            preamble: VERBAL_PASSAGES.TEST7_P1,
            options: ["Lower self-esteem.", "Lower scores on aptitude tests.", "Less participation in class.", "Higher self-esteem."],
            correctAnswer: "Higher self-esteem.",
            explanation: "'Some American research shows that girls attending single-sex schools have higher self-esteem...'"
        },
        {
            question: "What is the view of many experts regarding research into single-sex education?",
            preamble: VERBAL_PASSAGES.TEST7_P1,
            options: ["The research is conclusive and overwhelmingly positive.", "The research is inconclusive.", "The research proves co-educational environments are always worse.", "The research shows gender-based teaching is ineffective."],
            correctAnswer: "The research is inconclusive.",
            explanation: "'Many experts, however, believe that research into single-sex education is inconclusive...'"
        },
        {
            question: "What do single-sex schools subvert, according to the passage?",
            preamble: VERBAL_PASSAGES.TEST7_P1,
            options: ["Gender-fair education", "Stereotypical course-taking patterns and results", "Disciplinary problems", "The arguments of advocates"],
            correctAnswer: "Stereotypical course-taking patterns and results",
            explanation: "'Single-sex schools subvert stereotypical course-taking patterns and results.'"
        },
        {
            question: "A 2005 study claimed boys and girls in single-sex schools spent more time on what activity?",
            preamble: VERBAL_PASSAGES.TEST7_P1,
            options: ["Sports", "Socializing", "Homework", "Class participation"],
            correctAnswer: "Homework",
            explanation: "'A 2005 study claimed that both girls and boys attending single-sex schools spent more time on homework...'"
        },
        {
            question: "What is the new emphasis for NASA after the cancellation of the Constellation programme?",
            preamble: VERBAL_PASSAGES.TEST7_P2,
            options: ["Ending all space exploration.", "Increasing its budget to 5% of the federal budget.", "Developing new technologies and commercializing space flight.", "Focusing solely on manned missions to the moon."],
            correctAnswer: "Developing new technologies and commercializing space flight.",
            explanation: "'Instead, NASA will shift its emphasis to developing new technologies and commercializing space flight.'"
        },
        {
            question: "Who are among the most vocal critics of NASA's new vision?",
            preamble: VERBAL_PASSAGES.TEST7_P2,
            options: ["Internet entrepreneurs.", "Private companies developing spacecraft.", "Politicians whose states are losing jobs.", "The general public."],
            correctAnswer: "Politicians whose states are losing jobs.",
            explanation: "'Politicians whose states are losing out on jobs as a result of NASA’s cancelled programmes have been among the most vocal critics.'"
        },
        {
            question: "The Constellation human spaceflight programme was intended to provide transportation to where?",
            preamble: VERBAL_PASSAGES.TEST7_P2,
            options: ["The Moon", "Mars", "The International Space Station (ISS)", "Low Earth Orbit"],
            correctAnswer: "The International Space Station (ISS)",
            explanation: "'...it has cancelled its Constellation human spaceflight programme, which was intended to provide transportation to the International Space Station (ISS).'"
        },
        {
            question: "NASA's move to outsource its transportation to the ISS is designed to do what?",
            preamble: VERBAL_PASSAGES.TEST7_P2,
            options: ["Increase launch costs.", "Dramatically reduce launch costs.", "End the use of the ISS.", "Give NASA a monopoly on space flight."],
            correctAnswer: "Dramatically reduce launch costs.",
            explanation: "'NASA will outsource its transportation to the ISS – a move designed to dramatically reduce launch costs.'"
        },
        {
            question: "The heads of the private companies developing spacecraft are nearly all what?",
            preamble: VERBAL_PASSAGES.TEST7_P2,
            options: ["Former astronauts", "Government officials", "Internet entrepreneurs", "Aerospace engineers"],
            correctAnswer: "Internet entrepreneurs",
            explanation: "'Five private companies – nearly all of which are headed by internet entrepreneurs...'"
        },
        {
            question: "Where is the drug mephedrone manufactured?",
            preamble: VERBAL_PASSAGES.TEST7_P3,
            options: ["United Kingdom", "Sweden", "Eastern Africa", "China"],
            correctAnswer: "China",
            explanation: "'Manufactured in China and sold cheaply, the drug’s legality and availability have led to its meteoric rise.'"
        },
        {
            question: "Why is mephedrone currently legal in the United Kingdom?",
            preamble: VERBAL_PASSAGES.TEST7_P3,
            options: ["It is considered safe to use.", "It is sold as plant fertilizer and not subject to medical regulations.", "There is no scientific research on it.", "A government advisory council has approved it."],
            correctAnswer: "It is sold as plant fertilizer and not subject to medical regulations.",
            explanation: "'Because it is sold as plant fertilizer and thus not subject to medical regulations, mephedrone is currently legal in the United Kingdom...'"
        },
        {
            question: "Mephedrone is derived from compounds found in what plant?",
            preamble: VERBAL_PASSAGES.TEST7_P3,
            options: ["The coca plant", "The khat plant", "The opium poppy", "The cannabis plant"],
            correctAnswer: "The khat plant",
            explanation: "'...mephedrone is a synthetic stimulant that is derived from cathinone compounds found in the khat plant of Eastern Africa.'"
        },
        {
            question: "What are two street names for mephedrone mentioned in the passage?",
            preamble: VERBAL_PASSAGES.TEST7_P3,
            options: ["'Speed' and 'Ecstasy'", "'Drone' and 'Spice'", "'Meow meow' and 'drone'", "'M-cat' and 'bubbles'"],
            correctAnswer: "'Meow meow' and 'drone'",
            explanation: "'Also known as “meow meow” and “drone”...'"
        },
        {
            question: "In which year did the EU-funded Psychonaut Research Project state mephedrone became available?",
            preamble: VERBAL_PASSAGES.TEST7_P3,
            options: ["2006", "2008", "2010", "2012"],
            correctAnswer: "2008",
            explanation: "'...it has only been available since 2008...'"
        },
        {
            question: "What is 'greenwashing' in the context of ecotourism?",
            preamble: VERBAL_PASSAGES.TEST7_P4,
            options: ["When profits from ecotourism benefit the local economy.", "When a false impression of environmental friendliness is given.", "Responsible travel to natural areas.", "When high levels of visitors damage the ecosystem."],
            correctAnswer: "When a false impression of environmental friendliness is given.",
            explanation: "'...the industry is highly susceptible to “greenwashing” – whereby a false impression of environmental friendliness is given.'"
        },
        {
            question: "What is a major criticism of the ecotourism industry?",
            preamble: VERBAL_PASSAGES.TEST7_P4,
            options: ["It grows too slowly.", "The profits do not always benefit the local economy and workforce.", "It provides an alternative to industries like logging and mining.", "It is not dependent on foreign investment."],
            correctAnswer: "The profits do not always benefit the local economy and workforce.",
            explanation: "'...one of the main criticisms of the industry: that the profits generated from ecotourism do not benefit the local economy and work force.'"
        },
        {
            question: "What is the annual growth rate of the ecotourism sector?",
            preamble: VERBAL_PASSAGES.TEST7_P4,
            options: ["One to five percent", "Five to ten percent", "Ten to twenty percent", "Twenty to thirty percent"],
            correctAnswer: "Twenty to thirty percent",
            explanation: "'...ecotourism has become the fastest-growing sector of the tourism industry, growing at an annual rate of twenty to thirty percent.'"
        },
        {
            question: "More radical critics believe ecotourism is inherently flawed because travel uses what?",
            preamble: VERBAL_PASSAGES.TEST7_P4,
            options: ["Local resources", "Fossil fuels", "Renewable energy", "Animal labor"],
            correctAnswer: "Fossil fuels",
            explanation: "'...critics who believe that ecotourism is inherently flawed because travel that uses fossil fuels is damaging to the environment.'"
        },
        {
            question: "Ironically, what might counteract ecotourism's environmental goals?",
            preamble: VERBAL_PASSAGES.TEST7_P4,
            options: ["A lack of visitors", "Foreign investment", "Its own success leading to high visitor levels", "Dependency on local economies"],
            correctAnswer: "Its own success leading to high visitor levels",
            explanation: "'Ironically, ecotourism’s very success may counteract its environmental goals, as high levels of visitors – even careful ones – inevitably damage the ecosystem.'"
        }
    ],
    "Test 8": [
        {
            question: "The surrealism movement grew out of which earlier movement?",
            preamble: VERBAL_PASSAGES.TEST8_P1,
            options: ["Cubism", "Impressionism", "Dadaism", "Realism"],
            correctAnswer: "Dadaism",
            explanation: "The passage states surrealism 'grew out of Dadaism in the mid-1920s.'"
        },
        {
            question: "What was a key characteristic of surrealist works?",
            preamble: VERBAL_PASSAGES.TEST8_P1,
            options: ["A focus on reason and logic.", "The conventional positioning of everyday objects.", "The juxtaposition of seemingly unrelated objects in dreamlike settings.", "Ignoring Freud's theories."],
            correctAnswer: "The juxtaposition of seemingly unrelated objects in dreamlike settings.",
            explanation: "'Surrealist works, both visual and oral, juxtaposed seemingly unrelated everyday objects and placed these in dreamlike settings.'"
        },
        {
            question: "When did the surrealism movement spread across European arts and literature?",
            preamble: VERBAL_PASSAGES.TEST8_P1,
            options: ["Before the first world war", "Between the two world wars", "After the second world war", "In the 21st century"],
            correctAnswer: "Between the two world wars",
            explanation: "'Surrealism spread quite quickly across European arts and literature... between the two world wars.'"
        },
        {
            question: "Who was the founder of the surrealism movement?",
            preamble: VERBAL_PASSAGES.TEST8_P1,
            options: ["Salvador Dali", "Sigmund Freud", "Andre Breton", "The passage does not say"],
            correctAnswer: "Andre Breton",
            explanation: "'The movement’s founder – French poet Andre Breton...'"
        },
        {
            question: "What is an example of a powerful image used in Salvador Dali's surrealist paintings mentioned in the passage?",
            preamble: VERBAL_PASSAGES.TEST8_P1,
            options: ["Leaping tigers", "Flowering gardens", "Geometric shapes", "Historical figures"],
            correctAnswer: "Leaping tigers",
            explanation: "The passage lists 'powerful images such as leaping tigers, melting watches and metronomes.'"
        },
        {
            question: "What was one of the negative consequences of the Three Gorges Dam project?",
            preamble: VERBAL_PASSAGES.TEST8_P2,
            options: ["It supplied less than one percent of China's electricity.", "Over 1.3 million people were deliberately displaced.", "It made the Yangtze River harder to navigate.", "It increased the risk of flooding downstream."],
            correctAnswer: "Over 1.3 million people were deliberately displaced.",
            explanation: "'However, over 1.3 million people were deliberately displaced as part of the Gorges flooding project...'"
        },
        {
            question: "What is an argument made by supporters of the Three Gorges Dam?",
            preamble: VERBAL_PASSAGES.TEST8_P2,
            options: ["The dam has caused landslides.", "The dam has led to the death of fish species.", "It is better than relying on non-renewable coal power.", "Hundreds of archaeological sites were preserved."],
            correctAnswer: "It is better than relying on non-renewable coal power.",
            explanation: "The passage concludes, 'As the only other viable Chinese energy source continues to be non-renewable coal power, the hydroelectric power generated by the dam may be the lesser of two evils.'"
        },
        {
            question: "In which Chinese province is the Three Gorges Dam located?",
            preamble: VERBAL_PASSAGES.TEST8_P2,
            options: ["Guangdong", "Sichuan", "Hubei", "Yunnan"],
            correctAnswer: "Hubei",
            explanation: "'Spanning China’s 1.4-mile wide Yangtze River in the Hubei province...'"
        },
        {
            question: "How many state-of-the-art turbines does the dam have?",
            preamble: VERBAL_PASSAGES.TEST8_P2,
            options: ["Ten", "Twenty-six", "One hundred", "Over a thousand"],
            correctAnswer: "Twenty-six",
            explanation: "'...with twenty-six state-of-the-art turbines...'"
        },
        {
            question: "How long is the reservoir created by the dam's flooding project?",
            preamble: VERBAL_PASSAGES.TEST8_P2,
            options: ["1.4 miles long", "100km long", "660km-long", "The passage does not say"],
            correctAnswer: "660km-long",
            explanation: "'...that created the dam’s 660km-long reservoir.'"
        },
        {
            question: "What is 'offshoring'?",
            preamble: VERBAL_PASSAGES.TEST8_P3,
            options: ["Purchasing services from an external supplier within the same country.", "Keeping all business functions in-house.", "When outsourced functions are moved abroad.", "A politically insensitive way of increasing costs."],
            correctAnswer: "When outsourced functions are moved abroad.",
            explanation: "The passage defines it as, '“Offshoring”, when functions are moved abroad, often to India or China...'"
        },
        {
            question: "How does outsourcing encourage underdeveloped countries to invest in education?",
            preamble: VERBAL_PASSAGES.TEST8_P3,
            options: ["It doesn't; it discourages investment.", "By guaranteeing that cost benefits are passed to the consumer.", "The potential profits from outsourcing operations encourage investment.", "By increasing the average wage in those countries."],
            correctAnswer: "The potential profits from outsourcing operations encourage investment.",
            explanation: "'The potential profits from outsourcing operations encourage underdeveloped countries to invest in the necessary educational infrastructure and skills training...'"
        },
        {
            question: "What business function is typically kept in-house when manufacturing is outsourced?",
            preamble: VERBAL_PASSAGES.TEST8_P3,
            options: ["HR functions", "Finance functions", "Customer service", "The design function"],
            correctAnswer: "The design function",
            explanation: "'The manufacture of goods has even become part of this trend; though the design function is typically kept in-house.'"
        },
        {
            question: "The competitive marketplace in which service providers operate gets squeezed as they vie for what?",
            preamble: VERBAL_PASSAGES.TEST8_P3,
            options: ["Higher profits", "Client contracts", "Skilled employees", "Government subsidies"],
            correctAnswer: "Client contracts",
            explanation: "'...the competitive marketplace in which service providers companies operate gets squeezed as they vie for client contracts.'"
        },
        {
            question: "Higher corporate profits from offshoring may be seen to be at the expense of what?",
            preamble: VERBAL_PASSAGES.TEST8_P3,
            options: ["The consumer", "The design function", "High-wage economies", "Low-wage economies"],
            correctAnswer: "Low-wage economies",
            explanation: "'Still, higher corporate profits may be seen to be at the expense of low-wage economies...'"
        },
        {
            question: "What is a major barrier to the mass adoption of hydrogen-fuelled cars?",
            preamble: VERBAL_PASSAGES.TEST8_P4,
            options: ["They are not safer than petrol cars.", "They cannot be produced from renewable sources.", "Existing designs are extremely expensive.", "They emit more carbon dioxide than hybrid cars."],
            correctAnswer: "Existing designs are extremely expensive.",
            explanation: "'The existing designs for hydrogen fuelled cars are extremely expensive.'"
        },
        {
            question: "Compared to hybrid cars, what do hydrogen-fuelled cars emit?",
            preamble: VERBAL_PASSAGES.TEST8_P4,
            options: ["Reduced levels of carbon dioxide.", "Only water.", "Greenhouse gases.", "Nothing."],
            correctAnswer: "Only water.",
            explanation: "'...hybrids emit reduced levels of carbon dioxide, whereas hydrogen-fuelled cars emit only water and so are 100% clean.'"
        },
        {
            question: "What fraction of greenhouse gas emissions do cars account for?",
            preamble: VERBAL_PASSAGES.TEST8_P4,
            options: ["Roughly a tenth", "Roughly a quarter", "Roughly a third", "Roughly a half"],
            correctAnswer: "Roughly a third",
            explanation: "'Since cars account for roughly a third of greenhouse gas emissions...'"
        },
        {
            question: "How much does the National Research Association estimate would be needed to set up the required refuelling stations?",
            preamble: VERBAL_PASSAGES.TEST8_P4,
            options: ["£8 million", "£800 million", "£8 billion", "£80 billion"],
            correctAnswer: "£8 billion",
            explanation: "'The National Research Association also estimates that £8 billion would be needed to set-up the refuelling stations...'"
        },
        {
            question: "For a mass market product to be developed, the passage suggests there needs to be increased cooperation between whom?",
            preamble: VERBAL_PASSAGES.TEST8_P4,
            options: ["Manufacturers and consumers", "Governments and industry", "Scientists and engineers", "Environmental groups and car companies"],
            correctAnswer: "Governments and industry",
            explanation: "'For a mass market product to be developed there needs to be increased cooperation between governments and industry...'"
        }
    ],
    "Test 9": [
        {
            question: "Why do environmentalists fear Asian carp infiltrating the Great Lakes?",
            preamble: VERBAL_PASSAGES.TEST9_P1,
            options: ["They would improve the sports fishing industry.", "They would help preserve native species like salmon.", "They would damage the ecosystem.", "They are not a hazard to recreational boaters."],
            correctAnswer: "They would damage the ecosystem.",
            explanation: "'Environmentalists fear that carp will infiltrate the Great Lakes... where they would damage the ecosystem.'"
        },
        {
            question: "What is a reason business interests oppose blocking the locks on the Chicago canal?",
            preamble: VERBAL_PASSAGES.TEST9_P1,
            options: ["For environmental reasons.", "To help control the carp population.", "For economic reasons, as it's a major shipping lane.", "Because forcing traffic onto roads would reduce pollution."],
            correctAnswer: "For economic reasons, as it's a major shipping lane.",
            explanation: "'Business interests strongly oppose the closure of this major shipping lane for economic reasons...'"
        },
        {
            question: "When were Asian carp first introduced in the US?",
            preamble: VERBAL_PASSAGES.TEST9_P1,
            options: ["1970s", "1831", "2000s", "They are indigenous to the US"],
            correctAnswer: "1831",
            explanation: "'Introduced in the US in 1831, carp were originally intended for consumption...'"
        },
        {
            question: "Some species of Asian carp can grow to be over how many pounds?",
            preamble: VERBAL_PASSAGES.TEST9_P1,
            options: ["Fifty pounds", "One hundred pounds", "Two hundred pounds", "The passage does not specify"],
            correctAnswer: "One hundred pounds",
            explanation: "'...some species of Asian carp can grow to over one hundred pounds.'"
        },
        {
            question: "The US government currently spends how much per annum on Asian carp control?",
            preamble: VERBAL_PASSAGES.TEST9_P1,
            options: ["$8 million", "$18 million", "$80 million", "$800 million"],
            correctAnswer: "$80 million",
            explanation: "'The US government currently spends $80 million per annum on Asian carp control...'"
        },
        {
            question: "What is the most prevalent neurological condition in the developed world, according to the passage?",
            preamble: VERBAL_PASSAGES.TEST9_P2,
            options: ["Aura", "Serotonin deficiency", "Migraine", "Rebound headaches"],
            correctAnswer: "Migraine",
            explanation: "The first sentence states, 'The most prevalent neurological condition in the developed world, migraine...'"
        },
        {
            question: "What can overuse of pain medication for migraines lead to?",
            preamble: VERBAL_PASSAGES.TEST9_P2,
            options: ["An aura", "A permanent cure", "Chronic 'rebound headaches'", "Increased levels of serotonin"],
            correctAnswer: "Chronic 'rebound headaches'",
            explanation: "'...overuse of medication can lead to chronic “rebound headaches.”'"
        },
        {
            question: "What is an aura in the context of migraines?",
            preamble: VERBAL_PASSAGES.TEST9_P2,
            options: ["A type of severe headache", "A feeling of nausea", "A perceptual disturbance occurring before the onset", "A sensitivity to light and sound"],
            correctAnswer: "A perceptual disturbance occurring before the onset",
            explanation: "'Approximately one third of sufferers experience an aura – a perceptual disturbance occurring before the migraine’s onset.'"
        },
        {
            question: "What is a more widely held view on the cause of migraines than the vascular theory?",
            preamble: VERBAL_PASSAGES.TEST9_P2,
            options: ["Problems with blood vessels", "Low levels of the neurotransmitter serotonin", "Overuse of medication", "Dietary triggers"],
            correctAnswer: "Low levels of the neurotransmitter serotonin",
            explanation: "'A more widely held view is that migraines result from low levels of the neurotransmitter serotonin in the brain.'"
        },
        {
            question: "Newer drugs for migraine called triptans work by reducing what?",
            preamble: VERBAL_PASSAGES.TEST9_P2,
            options: ["Blood pressure", "Serotonin levels", "Pain information travelling to the brain", "Sensitivity to light"],
            correctAnswer: "Pain information travelling to the brain",
            explanation: "'...newer drugs called triptans work by reducing pain information travelling to the brain.'"
        },
        {
            question: "What is the principle of 'net neutrality'?",
            preamble: VERBAL_PASSAGES.TEST9_P3,
            options: ["Whereby all data is treated as equal.", "A tiered pricing structure for internet service.", "Whereby customers paying higher rates receive faster service.", "The idea that internet access is not a human right."],
            correctAnswer: "Whereby all data is treated as equal.",
            explanation: "'...violates the principle of net neutrality – whereby all data is treated as equal...'"
        },
        {
            question: "What argument do bandwidth suppliers use to justify tiered pricing?",
            preamble: VERBAL_PASSAGES.TEST9_P3,
            options: ["They want to limit the number of internet users.", "They are funding huge infrastructure updates.", "They believe all data should be treated equally.", "They want to reduce their profits."],
            correctAnswer: "They are funding huge infrastructure updates.",
            explanation: "'Suppliers argue that they are funding huge infrastructure updates – such as switching from copper wires to expensive fiberoptics – in order to improve services.'"
        },
        {
            question: "What percentage of the world's population is not connected to the web?",
            preamble: VERBAL_PASSAGES.TEST9_P3,
            options: ["20%", "50%", "80%", "90%"],
            correctAnswer: "80%",
            explanation: "'...the 80% of the world’s population that is not connected to the web...'"
        },
        {
            question: "What is the result when too many users try to move information at the same time, exceeding a channel's capacity?",
            preamble: VERBAL_PASSAGES.TEST9_P3,
            options: ["Faster service for everyone", "Information traffic jams", "Lower charges for use", "Increased bandwidth supply"],
            correctAnswer: "Information traffic jams",
            explanation: "'Information traffic jams result when too many users try to move information at the same time, exceeding the channel’s capacity.'"
        },
        {
            question: "To improve services, bandwidth suppliers are switching from copper wires to what?",
            preamble: VERBAL_PASSAGES.TEST9_P3,
            options: ["Satellite connections", "Wireless signals", "Fiberoptics", "Aluminum wires"],
            correctAnswer: "Fiberoptics",
            explanation: "'...switching from copper wires to expensive fiberoptics – in order to improve services.'"
        },
        {
            question: "What was the academic significance of finding a complete copy of the Book of Isaiah among the Dead Sea Scrolls?",
            preamble: VERBAL_PASSAGES.TEST9_P4,
            options: ["It proved the scrolls belonged to the Essenes.", "It enabled historians to analyse the accuracy of Bible translations.", "It was the only document found.", "It showed that the Jewish Revolt was successful."],
            correctAnswer: "It enabled historians to analyse the accuracy of Bible translations.",
            explanation: "'...documents such as a complete copy of the Book of Isaiah enabled historians to analyse the accuracy of Bible translations.'"
        },
        {
            question: "What is the competing theory to the traditional view that the Dead Sea Scrolls belonged to the Essenes?",
            preamble: VERBAL_PASSAGES.TEST9_P4,
            options: ["The scrolls were a precursor to Christianity.", "The scrolls were a hoax created in 1947.", "The documents are sacred texts from various Jewish communities hidden for safekeeping.", "The documents were written by the Romans."],
            correctAnswer: "The documents are sacred texts from various Jewish communities hidden for safekeeping.",
            explanation: "'A competing theory holds that the documents are sacred texts belonging to various Jewish communities, hidden in the caves for safekeeping...'"
        },
        {
            question: "When were the Dead Sea Scrolls found?",
            preamble: VERBAL_PASSAGES.TEST9_P4,
            options: ["In the first century CE", "1991", "1947", "68 CE"],
            correctAnswer: "1947",
            explanation: "'More than 800 ancient documents... were found in 1947 in desert caves at Qumran...'"
        },
        {
            question: "The texts of the Dead Sea Scrolls mainly date from between which two periods?",
            preamble: VERBAL_PASSAGES.TEST9_P4,
            options: ["The last century BCE and the first century CE", "The 19th and 20th centuries", "The first and second centuries BCE", "The medieval period"],
            correctAnswer: "The last century BCE and the first century CE",
            explanation: "'The texts mainly date from between the last century BCE and the first century CE...'"
        },
        {
            question: "In what year did the Huntington Library make photographic images of the full set of scrolls available to all researchers?",
            preamble: VERBAL_PASSAGES.TEST9_P4,
            options: ["1947", "1968", "1991", "2001"],
            correctAnswer: "1991",
            explanation: "'In 1991, the Huntington Library made photographic images of the full set of scrolls finally available to all researchers.'"
        }
    ],
    "Test 10": [
        {
            question: "Who typically attends the Bilderberg Group's annual conference?",
            preamble: VERBAL_PASSAGES.TEST10_P1,
            options: ["Only reporters and journalists.", "The general public.", "Financiers, industrialists, politicians, royalty, and newspaper editors.", "Only left-wing activists."],
            correctAnswer: "Financiers, industrialists, politicians, royalty, and newspaper editors.",
            explanation: "'Participants... typically include financiers, industrialists, politicians, royalty and newspaper editors.'"
        },
        {
            question: "What is a reason given by supporters of the Bilderberg Group?",
            preamble: VERBAL_PASSAGES.TEST10_P1,
            options: ["The group is a shadowy global government.", "The group is an unelected capitalist cabal.", "Modern democracies depend on cooperation between banking and politics.", "The group helps overthrow political leaders."],
            correctAnswer: "Modern democracies depend on cooperation between banking and politics.",
            explanation: "'...supporters argue that modern democracies depend on cooperation between banking and politics, and that organisations such as the Bilderberg Group help ensure their success.'"
        },
        {
            question: "How many people attend the Bilderberg Group's annual conference?",
            preamble: VERBAL_PASSAGES.TEST10_P1,
            options: ["120", "18", "Two", "Over 500"],
            correctAnswer: "120",
            explanation: "'...the Bilderberg Group holds an annual conference of 120 of the world’s most powerful and influential people.'"
        },
        {
            question: "The Bilderberg Group was established to promote understanding and cooperation between whom?",
            preamble: VERBAL_PASSAGES.TEST10_P1,
            options: ["The United States and Russia", "Europe and Asia", "The United States and Europe", "Capitalists and Communists"],
            correctAnswer: "The United States and Europe",
            explanation: "'The Group was established to promote understanding and cooperation between the United States and Europe...'"
        },
        {
            question: "What do left-wing activists accuse the group of being?",
            preamble: VERBAL_PASSAGES.TEST10_P1,
            options: ["A shadowy global government", "An unelected capitalist cabal", "A force for democracy", "A media organization"],
            correctAnswer: "An unelected capitalist cabal",
            explanation: "'Left-wing activists... accuse the Group of being an unelected capitalist cabal controlling world finance.'"
        },
        {
            question: "Where did the term 'irredentism' originally come from?",
            preamble: VERBAL_PASSAGES.TEST10_P2,
            options: ["The German nationalist movement.", "The Treaty of Versailles.", "The Italian nationalist movement 'Italia irredenta'.", "The wars in Yugoslavia."],
            correctAnswer: "The Italian nationalist movement 'Italia irredenta'.",
            explanation: "'...the term irredentism originally came from the Italian nationalist movement Italia irredenta.'"
        },
        {
            question: "What was a consequence of the new borders delineated by the Treaty of Versailles?",
            preamble: VERBAL_PASSAGES.TEST10_P2,
            options: ["It satisfied all of Italy's irredentist claims permanently.", "It gave rise to new irredentist claims.", "It prevented the Second World War.", "It perfectly took tribal boundaries into account in East Africa."],
            correctAnswer: "It gave rise to new irredentist claims.",
            explanation: "'...new borders delineated by the treaty gave rise to new irredentist claims.'"
        },
        {
            question: "What does the term 'Italia irredenta' mean?",
            preamble: VERBAL_PASSAGES.TEST10_P2,
            options: ["Unredeemed Italy", "Unified Italy", "Italian Empire", "The Italian Republic"],
            correctAnswer: "Unredeemed Italy",
            explanation: "'Meaning “unredeemed Italy”, Italian irredentism was an opinion movement...'"
        },
        {
            question: "The annexation of Italian territories from which country provided Italy's strongest motive for participating in World War I?",
            preamble: VERBAL_PASSAGES.TEST10_P2,
            options: ["France", "Germany", "Austria", "Yugoslavia"],
            correctAnswer: "Austria",
            explanation: "'The annexation of these Italian territories from Austria provided Italy with its strongest motive for participating in World War I.'"
        },
        {
            question: "The artificial political states created by the Treaty of Versailles in which region failed to take tribal boundaries into account?",
            preamble: VERBAL_PASSAGES.TEST10_P2,
            options: ["The Near East", "East Africa", "Central Europe", "The Balkans"],
            correctAnswer: "East Africa",
            explanation: "'The artificial political states created by the Treaty of Versailles in East Africa failed to take tribal boundaries into account...'"
        },
        {
            question: "What accounts for 70% of the world's fresh water use?",
            preamble: VERBAL_PASSAGES.TEST10_P3,
            options: ["Drinking and sanitation in developing countries.", "Industry in the developed world.", "Agriculture.", "The retreat of Himalayan glaciers."],
            correctAnswer: "Agriculture.",
            explanation: "'Agriculture accounts for 70% of the world’s fresh water use...'"
        },
        {
            question: "What has been a consequence of rising temperatures mentioned in the passage?",
            preamble: VERBAL_PASSAGES.TEST10_P3,
            options: ["Increased access to clean water for everyone.", "Decreased water consumption in the developed world.", "The Himalayan glaciers have retreated.", "A decrease in the world's population."],
            correctAnswer: "The Himalayan glaciers have retreated.",
            explanation: "'Rising temperatures have caused the Himalayan glaciers, the source for all of Asia’s major rivers, to retreat.'"
        },
        {
            question: "The passage states that many organisations predict the global water crisis presents this century's what?",
            preamble: VERBAL_PASSAGES.TEST10_P3,
            options: ["Greatest opportunity", "Biggest threat", "Most complex problem", "Easiest challenge"],
            correctAnswer: "Biggest threat",
            explanation: "'Many organisations predict that the global water crisis presents this century’s biggest threat.'"
        },
        {
            question: "How many more people have access to clean water in developing countries now than in 1990?",
            preamble: VERBAL_PASSAGES.TEST10_P3,
            options: ["1 billion", "2 billion", "500 million", "The number is not mentioned"],
            correctAnswer: "2 billion",
            explanation: "'Today 84% of people in developing countries have access to clean water, 2 billion more than in 1990.'"
        },
        {
            question: "In the developed world, how often is water consumption doubling?",
            preamble: VERBAL_PASSAGES.TEST10_P3,
            options: ["Every ten years", "Every twenty years", "Every fifty years", "It is not doubling"],
            correctAnswer: "Every twenty years",
            explanation: "'In the developed world, water consumption is unsustainably high, doubling every twenty years.'"
        },
        {
            question: "What is the 'grey goo problem'?",
            preamble: VERBAL_PASSAGES.TEST10_P4,
            options: ["A benefit of nanotechnology for providing clean energy.", "The use of nanotechnology in sunscreens.", "A doomsday scenario where self-replicating nanobots consume the Earth's ecosystem.", "A global watchdog organisation for nanotechnology."],
            correctAnswer: "A doomsday scenario where self-replicating nanobots consume the Earth's ecosystem.",
            explanation: "'...self-replicating nanobots could get out of control and consume the Earth’s ecosystem, a doomsday scenario known as the grey goo problem.'"
        },
        {
            question: "What do proponents of nanotechnology advocate to address concerns about its potential problems?",
            preamble: VERBAL_PASSAGES.TEST10_P4,
            options: ["Banning all nanotechnology research.", "Ignoring the potential problems.", "Strict regulation and a global watchdog organisation.", "Focusing only on creating new weapons."],
            correctAnswer: "Strict regulation and a global watchdog organisation.",
            explanation: "'To address such concerns, proponents of nanotechnology advocate strict regulation of the field and the establishment of a global watchdog organisation.'"
        },
        {
            question: "A nanometre is what fraction of a metre?",
            preamble: VERBAL_PASSAGES.TEST10_P4,
            options: ["A millionth", "A billionth", "A trillionth", "A thousandth"],
            correctAnswer: "A billionth",
            explanation: "'A nanometre is a billionth of a metre...'"
        },
        {
            question: "Nanotechnology enables the manipulation of matter with at least one dimension sized from what to what?",
            preamble: VERBAL_PASSAGES.TEST10_P4,
            options: ["1 to 10 nanometres", "1 to 100 nanometres", "100 to 1000 nanometres", "The passage does not specify"],
            correctAnswer: "1 to 100 nanometres",
            explanation: "'Nanotechnology enables the manipulation of matter with at least one dimension sized from 1 to 100 nanometres.'"
        },
        {
            question: "What is an example of a product already manufactured using nanotechnology mentioned in the passage?",
            preamble: VERBAL_PASSAGES.TEST10_P4,
            options: ["Food", "Cars", "Sunscreen", "Houses"],
            correctAnswer: "Sunscreen",
            explanation: "'Already used in the manufacture of products including computer hard drives, clothing, and sunscreen...'"
        }
    ]
  },
  "Quantitative Reasoning": {
    "Test 1": [
        {
            question: "What were the earnings from the sales of silver goods in the Apr-Jun 1994 quarter?",
            graphData: QUANTITATIVE_GRAPHS.TEST1_Q1_Q2,
            options: ["£220,000", "£240,000", "£280,000", "£350,000", "£420,000"],
            correctAnswer: "£280,000",
            explanation: "Looking at the bar for 'Apr-Jun 94', the value on the y-axis is 280. Since the axis is in thousands of pounds, the earnings were £280,000."
        },
        {
            question: "By what percentage did the sales of silver goods decrease from the Oct-Dec 1993 quarter to the Jan-Mar 1994 quarter?",
            graphData: QUANTITATIVE_GRAPHS.TEST1_Q1_Q2,
            options: ["35.7%", "47.6%", "52.3%", "64.2%", "71.4%"],
            correctAnswer: "47.6%",
            explanation: "Sales in Oct-Dec 93 were £420,000. Sales in Jan-Mar 94 were £220,000. The decrease is 420 - 220 = 200. The percentage decrease is (200 / 420) * 100 = 47.619...%, which rounds to 47.6%."
        },
        {
            question: "What was the total number of consumer goods in stock at the end of March?",
            graphData: QUANTITATIVE_GRAPHS.TEST1_Q3_Q4,
            options: ["15,000", "20,000", "25,000", "30,000", "35,000"],
            correctAnswer: "25,000",
            explanation: "Find the 'Mar' column on the x-axis. The bar corresponding to 'Stock' (purple) reaches the 25 mark on the y-axis. Since the units are in thousands, this represents 25,000 items."
        },
        {
            question: "In which month was the number of goods sold greater than the number of goods manufactured?",
            graphData: QUANTITATIVE_GRAPHS.TEST1_Q3_Q4,
            options: ["Jan", "Feb", "Mar", "Apr", "May"],
            correctAnswer: "Feb",
            explanation: "Compare the 'Sold' (orange) and 'Manufactured' (green) bars for each month. In February, Sold (35) is greater than Manufactured (30). In May, Sold (45) is also greater than Manufactured (40). The question asks for 'a' month, and February is an option."
        },
        {
            question: "What percentage of men aged 45-64 use the internet?",
            graphData: QUANTITATIVE_GRAPHS.TEST1_Q5_Q7,
            options: ["38%", "42%", "72%", "76%", "89%"],
            correctAnswer: "76%",
            explanation: "Find the '45-64' age group on the x-axis. The bar for 'Men' (blue) corresponds to 76 on the y-axis, which represents 76%."
        },
        {
            question: "In which age group is the difference in internet use between men and women the smallest?",
            graphData: QUANTITATIVE_GRAPHS.TEST1_Q5_Q7,
            options: ["16-24", "25-44", "45-64", "65-74", "75+"],
            correctAnswer: "16-24",
            explanation: "Calculate the difference for each age group: 16-24 (88-88=0), 25-44 (89-87=2), 45-64 (76-72=4), 65-74 (42-38=4), 75+ (16-14=2). The smallest difference is 0, in the 16-24 age group."
        }
    ]
  }
};

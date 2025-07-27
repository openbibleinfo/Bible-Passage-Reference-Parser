"use strict";
import { bcv_parser } from "../esm/bcv_parser.js";
import * as lang from "../esm/lang/en.js";

describe("Real-world parsing", () => {
	let p = {};
	beforeEach(() => {
		p = {};
		p = new bcv_parser(lang);
		p.set_options({
			book_alone_strategy: "ignore",
			book_sequence_strategy: "ignore",
			osis_compaction_strategy: "bcv",
			captive_end_digits_strategy: "delete"
		});
	});
	it("should handle sample tweets", () => {
		expect(p.parse("Deut 28:21-65 lists sicknesses that are part of the curse").osis()).toEqual("Deut.28.21-Deut.28.65");
		expect(p.parse("The Bible is awesome! Great noticing the commonalities between Revelation 4 and Isaiah 6! Done work for now.").osis()).toEqual("Rev.4.1-Rev.4.11,Isa.6.1-Isa.6.13");
		expect(p.parse("Verse of the Day: Romans 5:10 - just a few days until Easter (see you at the Rave!)").osis()).toEqual("Rom.5.10");
		expect(p.parse("\"For who is God besides the Lord? And who is a rock? Only our God.\" 2 Sam 22:32 Good word to remember today.").osis()).toEqual("2Sam.22.32");
		expect(p.parse("Reading and reflecting on Philippians 1 & 2. ").osis()).toEqual("Phil.1.1-Phil.2.30");
		expect(p.parse("Reading Numbers 12 & John 11 this morning.").osis()).toEqual("Num.12.1-Num.12.16,John.11.1-John.11.57");
		expect(p.parse("Prov 14:1- The wise woman builds her house, but with her own hands the foolish one tears hers down").osis()).toEqual("Prov.14.1");
		expect(p.parse("Prov 14:1-The wise woman builds her house, but with her own hands the foolish one tears hers down").osis()).toEqual("Prov.14.1");
		expect(p.parse("Prov 14:12- The wise woman builds her house, but with her own hands the foolish one tears hers down").osis()).toEqual("Prov.14.12");
		expect(p.parse("daily Bible reading: Num 20-22; Mark 7:1-13").osis()).toEqual("Num.20.1-Num.22.41,Mark.7.1-Mark.7.13");
		expect(p.parse("later in the week...(Matt 5 and Ex 20)").osis()).toEqual("Matt.5.1-Matt.5.48,Exod.20.1-Exod.20.26");
		expect(p.parse("Answer: Rev 19, sword in mouth, Zech 14, it's over.").osis()).toEqual("Rev.19.1-Rev.19.21,Zech.14.1-Zech.14.21");
		expect(p.parse("LACK of faith. Matthew 13:58....  <3").osis()).toEqual("Matt.13.58");
		expect(p.parse("Matthew 6 : 25-34").osis()).toEqual("Matt.6.25-Matt.6.34");
		expect(p.parse("~~Psalm 17:6a, 8").osis()).toEqual("Ps.17.6,Ps.17.8");
		expect(p.parse("Deut. 32/4 says").osis()).toEqual("Deut.32.1-Deut.32.52,Deut.4.1-Deut.4.49");
		expect(p.parse("Isaiah 50:4-9a Hebrews 12:1-3  John 13..  ").osis()).toEqual("Isa.50.4-Isa.50.9,Heb.12.1-3John.1.13");
		expect(p.parse("speaking from 1 Corinthians 15:22 and this 2 Corinthians 12:9-11 2nite at 7.15pm").osis()).toEqual("1Cor.15.22,2Cor.12.9-2Cor.12.11");
		expect(p.parse("Matt. 5 thru 7...").osis()).toEqual("Matt.5.1-Matt.7.29");
		expect(p.parse("ROM 9 0 9 4").osis()).toEqual("Rom.9.4");
		expect(p.parse("\"For it is by grace you have been saved, through faith--and this not from yourslelves, it is the gift of God...\" Ephesians 2:8,0 NIV").osis()).toEqual("Eph.2.8");
		expect(p.parse("Matthew 13:10-16 10And the disciples came").osis()).toEqual("Matt.13.10-Matt.13.16");
		expect(p.parse("\"Why do you seek the living One among the dead?  He is not here, but He has risen.\" Luke 24:5b-6a").osis()).toEqual("Luke.24.5-Luke.24.6");
		expect(p.parse("Luke 24*5b Resurrection Is Coming").osis()).toEqual("Luke.24.5");
		expect(p.parse("You have to have wisdom and understanding and that comes from God (proverbs 1&2) then you increase your knowledge.").osis()).toEqual("Prov.1.1-Prov.2.22");
		expect(p.parse("\"How shall I repay the Lord for all the good things he has done for me?\"  Psalm 116: Verse 10.  I am reflecting on this on Maundy Thursday.").osis()).toEqual("Ps.116.10");
		expect(p.parse("Happy Good Friday people! Isaiah 54 Verse 15-17 is my personal mantra.  \"No weapon against you will prevail\"").osis()).toEqual("Isa.54.15-Isa.54.17");
		expect(p.parse("  Cant sleep? Check out Isaiah 26:3. Hope this helps. Then read Proverbs Chap 10. The whole chapter. Good night.").osis()).toEqual("Isa.26.3,Prov.10.1-Prov.10.32");
		expect(p.parse("  john 3:16 i memorized it when i was 5.  now i like john 3:16-18..  vs 17 and 18 go with it too. they kinda help/clarify vs 16.").osis()).toEqual("John.3.16,John.3.16-John.3.18,John.3.17-John.3.18");
		expect(p.parse("Matt 4:8/9.").osis()).toEqual("Matt.4.8-Matt.4.9");
		expect(p.parse("Isa41.10ESV fear not for I am with you").osis_and_indices()).toEqual([
			{
				osis: "Isa.41.10",
				indices: [0, 11],
				translations: ["ESV"]
			}
		]);
		expect(p.parse("studying Acts 1:1-14 for a sermon next Sunday... learning more and more about Luke-Acts").osis()).toEqual("Acts.1.1-Acts.1.14");
		expect(p.parse("Matthew 28  1: Now after").osis()).toEqual("Matt.28.1");
		expect(p.parse("EASTER SUNDAY READINGS: Acts of the Apostles 10:34. 37-43; RESPONSORIAL PSALM: Ps 117; Colossians 3:1-4; John 20:1-9.").osis()).toEqual("Acts.10.34,Acts.10.37-Acts.10.43,Ps.117.1-Ps.117.2,Col.3.1-Col.3.4,John.20.1-John.20.9");
		expect(p.parse("1 Thessalonians 3:11-1311Now may our God and Father himself and our Lord Jesus clear the way for us to come to you.").osis()).toEqual("1Thess.3.11");
		expect(p.parse("Acts 10:34, 37-43Psalms 118:1-2").osis()).toEqual("Acts.10.34,Acts.10.37-Acts.10.43,Ps.118.1-Ps.118.2");
		expect(p.parse("Second Reading - Gen 22:1-2, 9a, 10-13, 15-18 ...   ").osis()).toEqual("Gen.22.1-Gen.22.2,Gen.22.9-Gen.22.13,Gen.22.15-Gen.22.18");
		expect(p.parse("Luv Deut 8 Especially Deu 8:18. 4 thou").osis()).toEqual("Deut.8.1-Deut.8.20,Deut.8.18,Deut.8.4");
		expect(p.parse("His ride into Jerusalem ~480 years before the day(Zech 9:9)... his death ~600 years before he spoke his final words on the cross(Ps 22).").osis()).toEqual("Zech.9.9,Ps.22.1-Ps.22.31");
		expect(p.parse(" John 4 \u2013 v22").osis()).toEqual("John.4.22");
		expect(p.parse("Verse of the Week ~ Psalm 89 - 2009.04.11  ").osis()).toEqual("Ps.89.1-Ps.89.52");
		expect(p.parse("Col1:18, 1Th 4:16").osis()).toEqual("Col.1.18,1Thess.4.16");
		expect(p.parse("Matthew 26:28.5").osis()).toEqual("Matt.26.28,Matt.26.5");
		expect(p.parse("1\u00a0Cor\u00a02\u00a01").osis()).toEqual("1Cor.2.1");
		expect(p.parse("Mark \t\u00a0\r\n 9").osis_and_indices()).toEqual([
			{
				osis: "Mark.9.1-Mark.9.50",
				indices: [0, 11],
				translations: [""]
			}
		]);
		expect(p.parse("He has given proof of ths 2 all men by raising Him from the dead. Acts 17:31").osis()).toEqual("Acts.17.31");
		expect(p.parse("John 3:16~17").osis()).toEqual("John.3.16-John.3.17");
		expect(p.parse("*Romans*8:38-39").osis()).toEqual("Rom.8.38-Rom.8.39");
		expect(p.parse("rev.1:4. \"7 spirits before the throne.\"").osis()).toEqual("Rev.1.4");
		expect(p.parse("April 14:  Deut. 34:1-Joshua 2:24; Psalm 79; Proverbs 12:26; Joshua 2:8-14 The sheer variety of pe..  ").osis()).toEqual("Deut.34.1-Josh.2.24,Ps.79.1-Ps.79.13,Prov.12.26,Josh.2.8-Josh.2.14");
		expect(p.parse("Wednesday's Bible Reading: Proverbs 15, Mark 7,8 and 9  ").osis()).toEqual("Prov.15.1-Prov.15.33,Mark.7.1-Mark.9.50");
		expect(p.parse("Prov.1:20-33 vs.33But whoever").osis()).toEqual("Prov.1.20-Prov.31.31");
		expect(p.parse("read Gal 5:22-25 and1 Cor 13:4-13").osis()).toEqual("Gal.5.22-Gal.5.25,Gal.5.1");
		expect(p.parse("Psalm91-1:2 (1 of my faves)").osis()).toEqual("Ps.91.1-Ps.91.16,Ps.1.2");
		expect(p.parse("Ezekiel 25-16").osis()).toEqual("Ezek.25.16");
		expect(p.parse("Proverbs 22:9;28:27A - 700 Club").osis()).toEqual("Prov.22.9,Prov.28.27");
		expect(p.parse("Psalm 125-1 Love it!").osis()).toEqual("Ps.125.1");
		expect(p.parse("challenged by Eph 4:11-16. Verse 16 is really speaking to me").osis()).toEqual("Eph.4.11-Eph.4.16,Eph.4.16");
		expect(p.parse("John - 4/18/2009 9:20:10 PM").osis()).toEqual("John.4.1-John.4.54,John.18.1-John.18.40");
		expect(p.parse("-Job 32:21-22-Col 3:25-Deut 10:17-Ja 2:1-4-Lev 19:15-Rom 2:9-11-Acts 10:34-35-Dt 1:17").osis()).toEqual("Job.32.21-Job.32.22,Col.3.25,Deut.10.17,Jas.2.1-Jas.2.4,Lev.19.15-Rom.2.9,Rom.2.11,Acts.10.34-Acts.10.35,Deut.1.17");
		expect(p.parse("Revelation 13:11:18").osis()).toEqual("Rev.13.11,Rev.13.18");
		expect(p.parse("===Read Mark chapter 5========Mark 6:30-32 NKJV 30 Then the apostles gathered").osis_and_translations()).toEqual([["Mark.5.1-Mark.5.43", "NKJV"], ["Mark.6.30-Mark.6.32", "NKJV"]]);
		expect(p.parse("look at psalms 42:1, hebrews 13-15, jeremiah 33-11").osis()).toEqual("Ps.42.1,Heb.13.15,Jer.33.11");
		expect(p.parse("Though he fall, he shall not be utterly cast down: for the LORD upholdeth him with his hand. (Psalm 37:,24)").osis()).toEqual("Ps.37.1-Ps.37.40,Ps.24.1-Ps.24.10");
		expect(p.parse("gal?: 4 People").osis()).toEqual("");
		expect(p.parse("1 peter 1-7 1 peter 8-22 Always").osis()).toEqual("1Pet.1.7");
		expect(p.parse("(Psalm 19:1.8)").osis()).toEqual("Ps.19.1,Ps.19.8");
		expect(p.parse("1John3v21,22; 1John5v14,15 #prayer #bibleStudy").osis()).toEqual("1John.3.21-1John.3.22,1John.5.14-1John.5.15");
		expect(p.parse("2 Peter 1:1-11 1 Simon Peter").osis()).toEqual("2Pet.1.1-2Pet.1.11,2Pet.1.1");
		expect(p.parse("2 Corinthians 12-9-10-11").osis()).toEqual("2Cor.12.9-2Cor.12.10,2Cor.12.11");
		expect(p.parse("Philippians 4~6-7").osis()).toEqual("Phil.4.1-Phil.4.23");
		expect(p.parse("Eccl11.7msg").osis_and_translations()).toEqual([["Eccl.11.7", "MSG"]]);
		expect(p.parse("Matthew 12.15_32, rainy").osis()).toEqual("Matt.12.15");
		expect(p.parse("From the Bible,1stTim.4:1-2,1st.John4:1-6.there").osis()).toEqual("1Tim.4.1-1Tim.4.2,1John.4.1-1John.4.6");
		expect(p.parse("for Exodus 20 7th Day of rest.").osis()).toEqual("Exod.20.1-Exod.20.26");
		expect(p.parse("Devotions: John 8:12-30,Luke: 8:4-11,Romans 3:21-26").osis()).toEqual("John.8.12-John.8.30,Luke.8.4-Luke.8.11,Rom.3.21-Rom.3.26");
		expect(p.parse("read isaiah 1-thru-7").osis()).toEqual("Isa.1.1-Isa.7.25");
		expect(p.parse("psalm37::5").osis()).toEqual("Ps.37.5");
		expect(p.parse("Deuteronomy 6,7Ecclesiastes 2John 19").osis()).toEqual("Deut.6.1-Deut.7.26");
		expect(p.parse("Bible study tonight on Colossians 1:13-14 and 1:20+.").osis()).toEqual("Col.1.13-Col.1.14,Col.1.20");
		expect(p.parse("(Heb 11.1nrsv)").osis_and_indices()).toEqual([
			{
				osis: "Heb.11.1",
				indices: [1, 13],
				translations: ["NRSV"]
			}
		]);
		expect(p.parse("my mouth (HCSB) Psalm 119-103").osis_and_indices()).toEqual([
			{
				osis: "Ps.119.103",
				indices: [16, 29],
				translations: [""]
			}
		]);
		expect(p.parse("2 Timothy 3;1-5").osis()).toEqual("2Tim.3.1-2Tim.3.17,2Tim.1.5");
		expect(p.parse("2 Timothy 3; NIV, 1-5 ESV").osis_and_translations()).toEqual([["2Tim.3.1-2Tim.3.17", "NIV"], ["2Tim.1.5", "ESV"]]);
		expect(p.parse("2 Timothy 3; NIV, ch. 1 ESV").osis_and_translations()).toEqual([["2Tim.3.1-2Tim.3.17", "NIV"], ["2Tim.1.1-2Tim.1.18", "ESV"]]);
		expect(p.parse("2 Timothy 3; NIV, vv 1-5 ESV").osis_and_indices()).toEqual([
			{
				osis: "2Tim.3.1-2Tim.3.17",
				indices: [0, 16],
				translations: ["NIV"]
			}, {
				osis: "2Tim.3.1-2Tim.3.5",
				indices: [18, 28],
				translations: ["ESV"]
			}
		]);
		expect(p.parse("2nd Reading: Ecc 6 \u2013 v12 James 4:14.").osis()).toEqual("Eccl.6.12,Jas.4.14");
		expect(p.parse("Jas 1:26,27. Vs 26- bridle.").osis()).toEqual("Jas.1.26-Jas.1.27,Jas.1.26");
		expect(p.parse("Ezekiel - 25-17.mp3").osis()).toEqual("Ezek.25.17");
		expect(p.parse("2 CORITHIANS VERSE 3-11 EPHESIANS 6 -10").osis()).toEqual("2Cor.1.3-2Cor.1.11,Eph.6.10");
		expect(p.parse("1Samuel 16:13 e 16:7! :)").osis()).toEqual("1Sam.16.13,1Sam.16.7");
		expect(p.parse("1Samuel 16:13 f 16:7! :)").osis()).toEqual("1Sam.16.13-1Sam.16.23,1Sam.16.7");
		expect(p.parse("proverbs 5/18-23").osis()).toEqual("Prov.5.1-Prov.5.23,Prov.18.1-Prov.23.35");
		expect(p.parse("1 Corinthians 4-7 and 8.").osis()).toEqual("1Cor.4.1-1Cor.8.13");
		expect(p.parse("1 Corinthians 12:28,Ephesians 4:7-8, 11-Revelation 18:20").osis()).toEqual("1Cor.12.28,Eph.4.7-Eph.4.8,Eph.4.11-Rev.18.20");
		expect(p.parse("Deut 15 \u2013 v19-23").osis()).toEqual("Deut.15.19-Deut.15.23");
		expect(p.parse("(2Ch 26:15).").osis()).toEqual("2Chr.26.15");
		expect(p.parse("James 1. Vv 2 thru 4.").osis()).toEqual("Jas.1.1-Jas.1.27,Jas.1.2-Jas.1.4");
		expect(p.parse("Num6.25-26also look@ Philipp2.15hav warm day").osis()).toEqual("Num.6.25-Num.6.26,Phil.2.15");
		expect(p.parse("Mark3.4.5.6.7.8.9.10.11").osis()).toEqual("Mark.3.4,Mark.5.6,Mark.7.8,Mark.9.10-Mark.9.11");
		expect(p.parse("Daily Scripture Reading: 2 Sam. 23-1 Kgs. 1 and Luke 22:39-71.").osis()).toEqual("2Sam.23.1-1Kgs.1.53,Luke.22.39-Luke.22.71");
		expect(p.parse("read matthew 24 and luke 21 and see 4 yourself!!!!").osis()).toEqual("Matt.24.1-Matt.24.51,Luke.21.1-Luke.21.38,Luke.4.1-Luke.4.44");
		expect(p.parse("Proverbs 1'20-24").osis()).toEqual("Prov.1.20-Prov.1.24");
		expect(p.parse("Devotions: John 10:22-42  vs 27 \"My sheep hear my voice").osis_and_indices()).toEqual([
			{
				osis: "John.10.22-John.21.25",
				indices: [11, 31],
				translations: [""]
			}
		]);
		expect(p.parse("Mark 16:2-17:3").osis()).toEqual("Mark.16.2-Mark.16.20");
		expect(p.parse("Leviticus 26.8. '5 shall chase a 100'.").osis()).toEqual("Lev.26.8");
		expect(p.parse("Leviticus 26.8. \"5 shall chase a 100'.").osis()).toEqual("Lev.26.8");
		expect(p.parse("Deuteronomy 6:4-9 and Matthew 22-34-40").osis()).toEqual("Deut.6.4-Deut.6.9,Matt.22.34-Matt.22.40");
		expect(p.parse("Psalm 40 - 12:02 AM").osis()).toEqual("Ps.40.1-Ps.40.17,Ps.12.2");
		expect(p.parse("Psalm 40 - 09:27 AM").osis()).toEqual("Ps.40.1-Ps.40.17");
		expect(p.parse("We lost a few judges... 5:00Pm").osis()).toEqual("");
		expect(p.parse("We lost a few judges... 5:01Pm").osis()).toEqual("");
		expect(p.parse("We lost a few judges. 5:01Pm").osis()).toEqual("Judg.5.1");
		expect(p.parse("Memorizing 2Cor 3:4.-6 this week. Quiz me!").osis()).toEqual("2Cor.3.4,2Cor.3.6");
		expect(p.parse("Isaiah 5;20b.").osis()).toEqual("Isa.5.1-Isa.5.30,Isa.20.1-Isa.20.6");
		expect(p.parse("1 Tim 2:2:11-15").osis()).toEqual("1Tim.2.2,1Tim.2.11-1Tim.2.15");
		expect(p.parse("in Ezek 34. Love how the Lectionary pulled together Ps 23, Ez, and John 10 on one day.").osis()).toEqual("Ezek.34.1-Ezek.34.31,Ps.23.1-Ps.23.6,John.10.1-John.10.42");
		expect(p.parse("Rom12?11").osis()).toEqual("Rom.12.1-Rom.12.21");
		expect(p.parse("MATTHEW 7 VS1-").osis()).toEqual("Matt.7.1");
		expect(p.parse("1 Kings 4:25 - Micah 4:4 - Zechariah 3:10‏").osis()).toEqual("1Kgs.4.25-Mic.4.4,Zech.3.10");
		expect(p.parse("Ephesians 4:5-6 (NKJV)  5 one Lord").osis()).toEqual("Eph.4.5-Eph.4.6");
		expect(p.parse("Judges 21:1-Ruth 1:22; John 4:4-42; Psalm 105:1-15; Proverbs 14:25 -  ").osis()).toEqual("Judg.21.1-Ruth.1.22,John.4.4-John.4.42,Ps.105.1-Ps.105.15,Prov.14.25");
		expect(p.parse("encourages Thes.5:11. 5Be a mom who laughs Prov.17:22. 6Be a mom who hugsLuke18:15").osis()).toEqual("Prov.17.22");
		expect(p.parse("...Whoever does these things will never be shaken.\" Psalm 15:2, 5b").osis()).toEqual("Ps.15.2,Ps.15.5");
		expect(p.parse("Colossians 2:6-7 ... 6 Therefore)  ").osis()).toEqual("Col.2.6-Col.2.7");
		expect(p.parse("Colossians 2:6-7:6").osis()).toEqual("Col.2.6-Col.4.18");
		expect(p.parse("1Samuel 28:20- 2Samuel 12:10").osis()).toEqual("1Sam.28.20-2Sam.12.10");
		expect(p.parse("Isaiah 53. 700 years before Jesus").osis()).toEqual("Isa.53.1-Isa.53.12");
		expect(p.parse("John.2.1-John.2.25").osis()).toEqual("John.2.1-John.2.25");
		expect(p.parse("1-John 2:25").osis()).toEqual("John.2.25");
		expect(p.parse("ROMANS 8 24_30").osis()).toEqual("Rom.8.1-Rom.8.39");
		expect(p.parse("(2.Chronicles 15.7 - NIV)").osis()).toEqual("2Chr.15.7");
		expect(p.parse("\"God So Loved the World, Part 1\" John 3:9-18  ").osis()).toEqual("John.3.9-John.3.18");
		expect(p.parse("Romans 5:12-21 0. Prelude").osis()).toEqual("Rom.5.12-Rom.5.21");
		expect(p.parse("Proverbs 6:/9-15").osis()).toEqual("Prov.6.1-Prov.6.35,Prov.9.1-Prov.15.33");
		expect(p.parse("origin of man in Genesis 1:27 vs 2:7.").osis()).toEqual("Gen.1.27,Gen.2.7");
		expect(p.parse("Genesis verse 6:4 and Numbers 13:33? ( ").osis()).toEqual("Gen.6.4,Num.13.33");
		expect(p.parse("2 corinthians 4~16").osis()).toEqual("2Cor.4.1-2Cor.4.18");
		expect(p.parse("OUR job is to 1 humble").osis()).toEqual("");
		expect(p.parse("Isa 1'18.\"Come").osis()).toEqual("Isa.1.18");
		expect(p.parse("Judges 21-Ruth 1; Psalm 105:1-15; Proverbs 14:25; Judges 21:25").osis()).toEqual("Judg.21.1-Ruth.1.22,Ps.105.1-Ps.105.15,Prov.14.25,Judg.21.25");
		expect(p.parse("Ps 34:1-4 Verse 4 reads").osis()).toEqual("Ps.34.1,Ps.4.4");
		expect(p.parse("is2prosper").osis()).toEqual("Isa.2.1-Isa.2.22");
		expect(p.parse("read THE PSALMS 5/ 29/ 95/ 1 CHRONICLES 29:10-13 LUKE 1:68-79").osis()).toEqual("Ps.5.1-Ps.5.12,Ps.29.1-Ps.29.11,Ps.95.1-Ps.95.11,1Chr.29.10-1Chr.29.13,Luke.1.68-Luke.1.79");
		expect(p.parse("Scripture Proverbs 31:10-31 (KJV)10Who can find").osis()).toEqual("Prov.31.10-Prov.31.31");
		expect(p.parse("Deut 28 - v66-67 is a real").osis()).toEqual("Deut.28.66-Deut.28.67");
		expect(p.parse("Josh 24, Duet 28!").osis()).toEqual("Josh.24.1-Josh.24.33,Deut.28.1-Deut.28.68");
		expect(p.parse("ph2o").osis()).toEqual("Phil.2.1-Phil.2.30");
		expect(p.parse("luke-111-13-").osis()).toEqual("Luke.13.1-Luke.13.35");
		expect(p.parse("IC4").osis()).toEqual("");
		expect(p.parse("Acts 14:19-28; Ps 145:10-11, 12-13ab, 21; Jn 14:27-31a").osis()).toEqual("Acts.14.19-Acts.14.28,Ps.145.10-Ps.145.13,John.14.27-John.14.31");
		expect(p.parse("Romans 1:16. 1 luv").osis()).toEqual("Rom.1.16,Rom.1.1");
		expect(p.parse("2nd Chapter of Acts - 8.25 USD").osis()).toEqual("Acts.2.1-Acts.8.25");
		expect(p.parse("John<3").osis()).toEqual("");
		expect(p.parse("Compare Is 59:16ff to Eph 6.").osis()).toEqual("Isa.59.16-Isa.59.21,Eph.6.1-Eph.6.24");
		expect(p.parse("Isaiah 54:10, 32:17. 55.12, 57:12").osis()).toEqual("Isa.54.10,Isa.32.17,Isa.55.12,Isa.57.12");
		expect(p.parse("John 12:20-13:20 compare verses 12:45 And whoever").osis()).toEqual("John.12.20-John.13.20,John.12.45");
		expect(p.parse("Numbers 15:37 - Malachi 4:2 - Mark 5:25").osis()).toEqual("Num.15.37-Mal.4.2,Mark.5.25");
		expect(p.parse("John 13:1-17, 31b-35Have").osis()).toEqual("John.13.1-John.13.17,John.13.31-John.13.35");
		expect(p.parse("Acts 2 Revelation: v1. Seven days").osis()).toEqual("Acts.2.1-Acts.2.47,Rev.1.1");
		expect(p.parse("Psalms 11 to 15 and Proverbs 3 . . . 5 chapters of Psalms and 1 chapter of Proverbs").osis()).toEqual("Ps.11.1-Ps.15.5,Prov.3.1-Prov.3.35,Ps.1.1-Ps.1.6");
		expect(p.parse("proverbs 31~ :30").osis()).toEqual("Prov.31.1-Prov.31.31,Prov.30.1-Prov.30.33");
		expect(p.parse("Finished translating Genesis 1 through verse 25.").osis()).toEqual("Gen.1.25");
		expect(p.parse("Luke 9..56").osis()).toEqual("Luke.9.1-Luke.9.62");
		expect(p.parse("Ecclesiastes 5:2 <-- 3").osis()).toEqual("Eccl.5.2");
		expect(p.parse("Deal with it: Matthew 10:32. 33").osis()).toEqual("Matt.10.32-Matt.10.33");
		expect(p.parse("Prov.28:5   6/25").osis()).toEqual("Prov.28.5-Prov.28.6,Prov.28.25");
		expect(p.parse("rev8:1.5, and there").osis()).toEqual("Rev.8.1,Rev.8.5");
		expect(p.parse("*ROM 11 *TO 29").osis()).toEqual("Rom.11.29");
		expect(p.parse("Ps 62:1-2 verse 2").osis()).toEqual("Ps.62.1,Ps.2.2");
		expect(p.parse("Psalm 109:30 ;0)").osis()).toEqual("Ps.109.30");
		expect(p.parse("a king 6-9").osis()).toEqual("");
		expect(p.parse("1Thes 3-4 \u2013 4:13-16").osis()).toEqual("1Thess.3.1-1Thess.4.18,1Thess.4.13-1Thess.4.16");
		expect(p.parse("Ps 26/40/58/61-62/64: Psalm 26:").osis()).toEqual("Ps.26.1-Ps.26.12,Ps.40.1-Ps.40.17,Ps.58.1-Ps.58.11,Ps.61.1-Ps.62.12,Ps.64.1-Ps.64.10,Ps.26.1-Ps.26.12");
		expect(p.parse("portrayed by Luke - Acts 11,13").osis()).toEqual("Acts.11.1-Acts.11.30,Acts.13.1-Acts.13.52");
		expect(p.parse("Today's meditation. Psalm 1, 3, 8, 15 16, 18").osis()).toEqual("Ps.1.1-Ps.1.6,Ps.3.1-Ps.3.8,Ps.8.1-Ps.8.9");
		expect(p.parse("matt 22:37,2nd part").osis()).toEqual("Matt.22.37,Matt.22.2");
		expect(p.parse("John 13:15, 34b").osis()).toEqual("John.13.15,John.13.34");
		expect(p.parse("John 13:15, 34began").osis()).toEqual("John.13.15");
		expect(p.parse("John 13:15, 34 began").osis_and_indices()).toEqual([
			{
				osis: "John.13.15,John.13.34",
				indices: [0, 14],
				translations: [""]
			}
		]);
		expect(p.parse("Eph. 4:26-27.30. NIV.").osis()).toEqual("Eph.4.26-Eph.6.24");
		expect(p.parse("so. See 3 John 5-8.").osis_and_indices()).toEqual([
			{
				osis: "3John.1.5-3John.1.8",
				indices: [8, 18],
				translations: [""]
			}
		]);
		expect(p.parse("Dan, verse 14").osis_and_indices()).toEqual([
			{
				osis: "Dan.1.14",
				indices: [0, 13],
				translations: [""]
			}
		]);
		expect(p.parse("Isaiah 41:10 is my").osis_and_indices()).toEqual([
			{
				osis: "Isa.41.10",
				indices: [0, 12],
				translations: [""]
			}
		]);
		expect(p.parse("Isaiah 41:10 ha ha ha").osis_and_indices()).toEqual([
			{
				osis: "Isa.41.10",
				indices: [0, 12],
				translations: [""]
			}
		]);
		expect(p.parse("see Isaiah 47:148:22 - Ps 117:7-10 - Gal 3:2").osis_and_indices()).toEqual([
			{
				osis: "Gal.3.2",
				indices: [37, 44],
				translations: [""]
			}
		]);
		expect(p.parse("matt CHAPTER 1, verse 9 NIV").osis()).toEqual("Matt.1.9");
		expect(p.parse("Jude chapter 1, verse 9 NIV").osis()).toEqual("Jude.1.9");
		expect(p.parse("Jdg 12:11 break Judges 99,KJV").osis_and_indices()).toEqual([
			{
				osis: "Judg.12.11",
				indices: [0, 9],
				translations: [""]
			}
		]);
		expect(p.parse("Jdg 12:11 break Judges,chapter,12,KJV").osis_and_indices()).toEqual([
			{
				osis: "Judg.12.11",
				indices: [0, 9],
				translations: [""]
			}
		]);
		expect(p.parse("Jdg 12:11 break Judges 99,2,KJV").osis_and_indices()).toEqual([
			{
				osis: "Judg.12.11",
				indices: [0, 9],
				translations: [""]
			}, {
				osis: "Judg.2.1-Judg.2.23",
				indices: [16, 31],
				translations: ["KJV"]
			}
		]);
		expect(p.parse("Jdg 12:11 break Judges 2,99, KJV").osis_and_indices()).toEqual([
			{
				osis: "Judg.12.11",
				indices: [0, 9],
				translations: [""]
			}, {
				osis: "Judg.2.1-Judg.2.23",
				indices: [16, 32],
				translations: ["KJV"]
			}
		]);
		expect(p.parse("Gen 1;1:2 The earth").osis()).toEqual("Gen.1.1-Gen.1.31,Gen.1.2");
		expect(p.parse("Proverbs 4:25-27. 218 ").osis_and_indices()).toEqual([
			{
				osis: "Prov.4.25-Prov.4.27",
				indices: [0, 16],
				translations: [""]
			}
		]);
		expect(p.parse("Proverbs 4:25-27. 218 is").osis_and_indices()).toEqual([
			{
				osis: "Prov.4.25-Prov.27.27",
				indices: [0, 21],
				translations: [""]
			}
		]);
		expect(p.parse("Numbers 2-999").osis_and_indices()).toEqual([
			{
				osis: "Num.2.1-Num.36.13",
				indices: [0, 13],
				translations: [""]
			}
		]);
		expect(p.parse("Numbers 2- 999").osis_and_indices()).toEqual([
			{
				osis: "Num.2.1-Num.2.34",
				indices: [0, 9],
				translations: [""]
			}
		]);
		expect(p.parse("Ezk 1,4:5, 6 365").osis_and_indices()).toEqual([
			{
				osis: "Ezek.1.1-Ezek.1.28,Ezek.4.5-Ezek.4.6",
				indices: [0, 12],
				translations: [""]
			}
		]);
		expect(p.parse("is 15-14-12-25-7-15-4").osis_and_indices()).toEqual([
			{
				osis: "Isa.15.7,Isa.15.4",
				indices: [12, 21],
				translations: [""]
			}
		]);
		expect(p.parse("job is 2 f").osis_and_indices()).toEqual([
			{
				osis: "Isa.2.1-Isa.66.24",
				indices: [4, 10],
				translations: [""]
			}
		]);
		expect(p.parse("Ps. 78:24").osis()).toEqual("Ps.78.24");
		expect(p.parse("Father and the Son. (John 1 2:22)").osis_and_indices()).toEqual([
			{
				osis: "John.1.1-John.1.51,John.2.22",
				indices: [21, 32],
				translations: [""]
			}
		]);
		expect(p.parse("Readings from Ezekiel 25 and 26, Proverbs 23 and II Timothy 1 (KJV)").osis()).toEqual("Ezek.25.1-Ezek.26.21,Prov.23.1-Prov.23.35,2Tim.1.1-2Tim.1.18");
		expect(p.parse("firsts 3.1").osis()).toEqual("");
		expect(p.parse("seconds 3.1").osis()).toEqual("");
		expect(p.parse("1s. 3.1").osis()).toEqual("1Sam.3.1");
		expect(p.parse("2s. 3.1").osis()).toEqual("2Sam.3.1");
		expect(p.parse("help (1 Corinthians 12:1ff). The ").osis_and_indices()).toEqual([
			{
				osis: "1Cor.12.1-1Cor.12.31",
				indices: [6, 26],
				translations: [""]
			}
		]);
		expect(p.parse("PSALM 41 F-1-3 O LORD").osis_and_indices()).toEqual([
			{
				osis: "Ps.41.1-Ps.150.6,Ps.1.1-Ps.3.8",
				indices: [0, 14],
				translations: [""]
			}
		]);
		expect(p.parse("Luke 8:1-3; 24:10 (and Matthew 14:1-12 and Luke 23:7-12 for background)").osis_and_indices()).toEqual([
			{
				osis: "Luke.8.1-Luke.8.3,Luke.24.10",
				translations: [""],
				indices: [0, 17]
			}, {
				osis: "Matt.14.1-Matt.14.12,Luke.23.7-Luke.23.12",
				translations: [""],
				indices: [23, 55]
			}
		]);
		expect(p.parse("Ti 8- Nu 9- Ma 10- Re").osis()).toEqual("Num.9.1-Num.9.23,Matt.10.1-Matt.10.42");
		expect(p.parse("EX34 9PH to CO7").osis()).toEqual("Exod.34.9,Col.4.1-Col.4.18");
		expect(p.parse("Rom amp A 2 amp 3").parsed_entities()).toEqual([]);
		expect(p.parse("chapt. 11-1040 of II Kings").osis()).toEqual("");
		expect(p.parse("Matt 1, 3, 4,2, 5, chapter 6-8").osis()).toEqual("Matt.1.1-Matt.1.25,Matt.3.1-Matt.4.25,Matt.2.1-Matt.2.23,Matt.5.1-Matt.8.34");
	});
	it("shouldn't crash in this scenario", () => {
		p.set_options({
			passage_existence_strategy: "c",
			book_alone_strategy: "full"
		});
		expect(p.parse("2John-Phil 9ff").osis()).toEqual("Phil.4.1-Phil.4.999");
		expect(p.osis()).toEqual("Phil.4.1-Phil.4.999");
	});
	it("should handle fuzz test bugs", () => {
		expect(p.parse("Matthew ((ESV)").osis()).toEqual("");
	});
});

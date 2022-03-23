import Track from "./Track";
import { Source } from "./Track";
import { SongSection, MeasureBlock, SectionType} from "./SongSection";

export default class Tester {
    constructor() {

    }
    testAll() {

    }
    static assertEquals(result: any, expected: any, nn: string = "", showIfValid: boolean = true) {
        if(result !== expected) {
            return nn + " | :( Result: " + result + ", Expected: " + expected + "\n";
        }
        if(showIfValid)
            return nn + " | good :) " + result + "\n";
        return "";
    }
    static assertTrue(result: boolean, nn: string = "", showIfValid: boolean = true) {
        if(!result) {
            return nn + " | Result not expected" + "\n";
        }
        if(showIfValid)
            return nn + " | good :) " + result + "\n";
        return "";
    }
    static assertFalse(result: boolean, nn: string = "", showIfValid: boolean = true) {
        if(!result) {
            return nn + " | Result not expected" + "\n";
        }
        if(showIfValid)
            return nn + " | good :) " + result + "\n";
        return "";
    }
}

export class TestMeasureBlock extends Tester{
    blockInit = new MeasureBlock(false, 0, 120, 4, 10, 0);
    secInit = new MeasureBlock(false, 20000, 120, 4);

    testBlockToSec() {
        var name = "blockToMilli";
        var output: string = "";

        var measure = this.blockInit.copy();
        output += Tester.assertEquals(measure.measureCount, 10);
        output += Tester.assertEquals(measure.beatSubdivision, 0);
        output += Tester.assertEquals(measure.blockToMilli(), 20000, name);
        output += Tester.assertEquals(measure.blockToMilli(10, 2), 21000, name);
        output += Tester.assertEquals(measure.blockToMilli(10, 2.5), 21250, name);
        output += Tester.assertEquals(measure.blockToMilli(10, 3.75), 21875, name);

        return output;
    }
    testSecToBlock() {
        var name = "secToBlock"
        var output: string = "";

        this.secInit = new MeasureBlock(false, 20000, 120, 4);
        output += Tester.assertEquals(this.secInit.milliToBlock().toString(), [10, 0].toString(), name);
        this.secInit.setTime(21000);
        output += Tester.assertEquals(this.secInit.milliToBlock().toString(), [10, 2].toString(), name);
        this.secInit.setTime(21250);
        output += Tester.assertEquals(this.secInit.milliToBlock().toString(), [10, 2.5].toString(), name);
        this.secInit.setTime(21875);
        output += Tester.assertEquals(this.secInit.milliToBlock().toString(), [10, 3.75].toString(), name);
        this.secInit.setTime(23000);
        output += Tester.assertEquals(this.secInit.milliToBlock().toString(), [11, 2].toString(), name);
        this.secInit.setTime(1000);
        output += Tester.assertEquals(this.secInit.milliToBlock().toString(), [0, 2].toString(), name);
        this.secInit.setTime(500);
        output += Tester.assertEquals(this.secInit.milliToBlock().toString(), [0, 1].toString(), name);
        return output;
    }
    testSetBlock() {
        var name = "Set Block";
        var output: string = "";

        var measure = this.blockInit.copy();

        output += Tester.assertEquals(measure.getMilli(), 20000, name);
        measure.setBlock(10, 2);
        output += Tester.assertEquals(measure.getMilli(), 21000, name);
        measure.setBlock(10, 2.50);
        output += Tester.assertEquals(measure.getMilli(), 21250, name);
        measure.setBlock(10, 3.75);
        output += Tester.assertEquals(measure.getMilli(), 21875, name);

        return output;
    }
    testSetTime() {
        var name = "Set Time"
        var output: string = "";

        this.secInit = new MeasureBlock(false, 20000, 120, 4);
        output += Tester.assertEquals(this.secInit.getBlock().toString(), [10, 0].toString(), name);
        this.secInit.setTime(21000);
        output += Tester.assertEquals(this.secInit.getBlock().toString(), [10, 2].toString(), name);
        this.secInit.setTime(21250);
        output += Tester.assertEquals(this.secInit.getBlock().toString(), [10, 2.5].toString(), name);
        this.secInit.setTime(21875);
        output += Tester.assertEquals(this.secInit.getBlock().toString(), [10, 3.75].toString(), name);
        this.secInit.setTime(1000);
        output += Tester.assertEquals(this.secInit.getBlock().toString(), [0, 2].toString(), name);
        this.secInit.setTime(500);
        output += Tester.assertEquals(this.secInit.getBlock().toString(), [0, 1].toString(), name);
        return output;
    }
    testSetTempo() {
        var name = "Set Tempo";
        var output: string = "";

        var measure = this.blockInit.copy();
        output += Tester.assertEquals(measure.milliLength, 20000, name, false);
        output += Tester.assertEquals(measure.getTempo(), 120, name, false);
        output += Tester.assertEquals(measure.getBlock().toString(), [10, 0].toString(), name);
        measure.setTempo(150);
        output += Tester.assertEquals(measure.getTempo(), 150, name, false);
        output += Tester.assertEquals(measure.getBlock().toString(), [12, 2].toString(), name);
        measure.setTempo(100);
        output += Tester.assertEquals(measure.getBlock().toString(), [8,1.33].toString() , name);
        measure.setTempo(96);
        output += Tester.assertEquals(measure.getBlock().toString(), [8, 0].toString(), name);
        measure.setTempo(1);
        output += Tester.assertEquals(measure.getBlock().toString(), [0, 0.33].toString(), name);
        measure.setTempo(0);
        output += Tester.assertEquals(measure.getBlock().toString(), [0, .33].toString(), name);

        return output;
    }
    testSetBeatsPer() {
        var name = "Set Tempo";
        var output: string = "";

        var measure = this.blockInit.copy();
        output += Tester.assertEquals(measure.getBlock().toString(), [10, 0].toString(), name);
        measure.setBeatsPerMeasure(3);
        output += Tester.assertEquals(measure.getBlock().toString(), [13, 1].toString(), name);
        measure.setBeatsPerMeasure(5);
        output += Tester.assertEquals(measure.getBlock().toString(), [8, 0].toString(), name);
        measure.setBeatsPerMeasure(0);
        output += Tester.assertEquals(measure.getBlock().toString(), [8, 0].toString(), name);

        return output;
    }
}

export class TestSongSection extends Tester {
    defaultSection = new SongSection("dope", 20000, 40000, 120, "4:4");
    section = this.defaultSection.copy();

    testSetEnd() {
        var name = "set end"
        var output: string = "";
        this.section =this.defaultSection.copy();
        
        output += Tester.assertEquals(this.section.getTimeLength(), 20000, name, false);
        output += Tester.assertEquals(this.section.getEndTime(), 40000, name, false);
        
        this.section.setEndfromTimestamp(160000);
        output += Tester.assertEquals(this.section.getTimeLength(), 140000, name, false);
        output += Tester.assertEquals(this.section.getEndTime(), 160000, name);
        
        this.section.setEndfromTimestamp(21000);
        output += Tester.assertEquals(this.section.getTimeLength(), 2000, name, false);
        output += Tester.assertEquals(this.section.getEndTime(), 22000, name);
        this.section.setEndfromTimestamp(20000);
        output += Tester.assertEquals(this.section.getTimeLength(), 2000, name, false);
        output += Tester.assertEquals(this.section.getEndTime(), 22000, name);
        this.section.setEndfromTimestamp(19000);
        output += Tester.assertEquals(this.section.getTimeLength(), 2000, name, false);
        output += Tester.assertEquals(this.section.getEndTime(), 22000, name);

        //Test when minimum measure length dont matter none
        output += Tester.assertEquals(this.section.getStart(), 20000, name, false);
        this.section.setEndfromTimestamp(22000, false);
        output += Tester.assertEquals(this.section.getTimeLength(), 2000, name, false);
        output += Tester.assertEquals(this.section.getEndTime(), 22000, name, false);
        this.section.setEndfromTimestamp(21000, false);
        output += Tester.assertEquals(this.section.block.getMilli(), 1000, name, false);
        output += Tester.assertEquals(this.section.getEndTime(), 21000, name);
        var block = this.section.block;
        block.setTime(1000);
        output += Tester.assertEquals(block.getMilli(), 1000, name);
        output += Tester.assertEquals(this.section.getEndTime(), 21000, name);
        

        return output;
    }

    testSetStart() {
        var name = "setStart"
        var output: string = "";
        this.section =this.defaultSection.copy();
        
        output += Tester.assertEquals(this.section.getTimeLength(), 20000, name, false);
        output += Tester.assertEquals(this.section.getEndTime(), 40000, name, false);

        this.section.setStart(18000);
        output += Tester.assertEquals(this.section.getEndTime(), 40000, name, false);
        output += Tester.assertEquals(this.section.getTimeLength(), 22000, name);

        this.section.setStart(22000);
        output += Tester.assertEquals(this.section.getEndTime(), 40000, name, false);
        output += Tester.assertEquals(this.section.getTimeLength(), 18000, name);

        this.section.setStart(39000);
        output += Tester.assertEquals(this.section.getEndTime(), 40000, name, false);
        output += Tester.assertEquals(this.section.getTimeLength(), 2000, name);

        this.section.setStart(41000)
        output += Tester.assertEquals(this.section.getEndTime(), 40000, name, false);
        output += Tester.assertEquals(this.section.getTimeLength(), 2000, name);

        return output;
    }

    testBlockToTimestamp() {
        var name = "BlocktoTimestamp"
        var output: string = "";
        this.section =this.defaultSection.copy();
        
        output += Tester.assertEquals(this.section.blockToTimestamp(10, 0), 40000, name, false);
        output += Tester.assertEquals(this.section.blockToTimestamp(1, 0), 22000, name);
        output += Tester.assertEquals(this.section.blockToTimestamp(10, 3.75), 41875, name);

        return output;
    }

    testSecToBlock() {
        var name = "SecToBlock"
        var output: string = "";
        this.section =this.defaultSection.copy();
        
        output += Tester.assertEquals(this.section.milliToBlock(22000).toString(), [1, 0].toString(), name);
        output += Tester.assertEquals(this.section.milliToBlock(40000).toString(), [10, 0].toString(), name);
        output += Tester.assertEquals(this.section.milliToBlock(41000).toString(), [10, 0].toString(), name);
        output += Tester.assertEquals(this.section.milliToBlock(18000).toString(), [0, 0].toString(), name);
        output += Tester.assertEquals(this.section.milliToBlock(23000).toString(), [1, 2].toString(), name);

        return output;
    }

    testSnappedSec_measure() {
        var name0 = "SnappedSec Section"
        var name1 = "SnappedSec Measure"
        var output: string = "";
        this.section =this.defaultSection.copy();
        
        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, -1, 0), 20000, name0);
        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, -1, 29000), 20000, name0);
        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, -1, 30000), 40000, name0);
        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, -1, 31000), 40000, name0);
        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, -1, 100000), 40000, name0);

        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, 0, 0), 20000, name1);
        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, 0, 23000), 24000, name1);
        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, 0, 24900), 24000, name1);
        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, 0, 41000), 40000, name1);
        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, 0, 44000), 40000, name1);

        return output;
    }

    testSnappedSec_1and2() {
        var name0 = "SnappedSec beat"
        var name1 = "SnappedSec half beat"
        var output: string = "";
        this.section =this.defaultSection.copy();
        
        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, 1, 0), 20000, name0);
        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, 1, 20250), 20500, name0);
        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, 1, 20700), 20500, name0);
        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, 1, 20750), 21000, name0);

        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, 2, 0), 20000, name1);
        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, 2, 20125), 20250, name1);
        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, 2, 20700), 20750, name1);
        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, 2, 20750), 20750, name1);
        output += Tester.assertEquals(SongSection.getSnappedMilli(this.section, 2, 20760), 20750, name1);
        
        return output;
    }
}

export class TestTrack extends Tester {
    defaultSection = new SongSection("dope", 20000, 40000, 120, "4:4");
    defaultTrack = new Track(Source.Spotify, "", "");

    //TODO testGetSectionFromTimestamp
    testGetSectionFromTimestamp() {
        var s1 = new SongSection("A", 0, 120000, 120, "4:4");
        var s2 = new SongSection("B", 120000, 220000, 120, "4:4");
        var s3 = new SongSection("C", 220000, 240000, 120, "4:4");
        var track = this.defaultTrack.copy();
        track.setSections([s1, s2, s3]);
        var output = "";

        output += Tester.assertEquals(track.getSectionFromMilli(119000), 0);
        output += Tester.assertEquals(track.getSectionFromMilli(120000), 0);
        output += Tester.assertEquals(track.getSectionFromMilli(121000), 1);
        output += Tester.assertEquals(track.getSectionFromMilli(0), 0);
        output += Tester.assertEquals(track.getSectionFromMilli(219000), 1);
        output += Tester.assertEquals(track.getSectionFromMilli(220000), 1);
        output += Tester.assertEquals(track.getSectionFromMilli(240000), 2);
        output += Tester.assertEquals(track.getSectionFromMilli(-1), -1);
        output += Tester.assertEquals(track.getSectionFromMilli(241000), -1);


        return output;
    }
     //TODO testSplitSection
     testTestSplitSection() {
        var track = this.defaultTrack.copy();
        var output = "";

        output += Tester.assertEquals(track.splitSection(120000, 0), 120000, "", false);
        output += Tester.assertEquals(track.sectionList.length, 2, "", false);
        output += Tester.assertEquals(track.sectionList[0].getEndTime(), 120000, "", false);
        output += Tester.assertEquals(track.sectionList[1].getStart(), 120000, "", false);

        output += Tester.assertEquals(track.splitSection(240000, 1), 240000, "", false);
        output += Tester.assertEquals(track.sectionList.length, 2, "", false);
        output += Tester.assertEquals(track.sectionList[1].getEndTime(), 240000, "", false);

        output += Tester.assertEquals(track.splitSection(239000, 1), 238000, "", false);
        output += Tester.assertEquals(track.sectionList.length, 3, "", false);
        output += Tester.assertEquals(track.sectionList[1].getEndTime(), 238000, "", false);
        output += Tester.assertEquals(track.sectionList[2].getStart(), 238000, "", false);

        output += Tester.assertEquals(track.splitSection(239000, 2), -1, "", false);
        output += Tester.assertEquals(track.sectionList.length, 3, "", false);
        output += Tester.assertEquals(track.sectionList[1].getEndTime(), 238000, "", false);
        output += Tester.assertEquals(track.sectionList[2].getStart(), 238000, "", false);

        track.shiftSectionEndsIndex(236, 1);
        output += Tester.assertEquals(track.splitSection(239000, 2), 238000);
        output += Tester.assertEquals(track.sectionList.length, 4);
        output += Tester.assertEquals(track.sectionList[2].getEndTime(), 238000);
        output += Tester.assertEquals(track.sectionList[3].getStart(), 238000);

        output += Tester.assertEquals(track.splitSection(241000, 3), 240000);
        output += Tester.assertEquals(track.sectionList.length, 4);
        output += Tester.assertEquals(track.sectionList[2].getEndTime(), 238000);
        output += Tester.assertEquals(track.sectionList[3].getStart(), 238000);

        output += Tester.assertEquals(track.splitSection(0, 0), 0);
        output += Tester.assertEquals(track.sectionList.length, 4);
        output += Tester.assertEquals(track.sectionList[2].getEndTime(), 238000);
        output += Tester.assertEquals(track.sectionList[3].getStart(), 238000);

        return output;
    }
    //TODO testShiftSectionEnds
    testShiftSectionEnds() {
        var s1 = new SongSection("A", 0, 120000, 120, "4:4");
        var s2 = new SongSection("B", 120000, 220000, 120, "4:4");
        var s3 = new SongSection("C", 220000, 240000, 120, "4:4");
        var track = this.defaultTrack.copy();
        track.setSections([s1, s2, s3]);
        var output = "";

        output += Tester.assertEquals(s1.getEndTime(), 120000, "", false);
        output += Tester.assertEquals(s2.getStart(), 120000, "", false);

        track.shiftSectionEndsIndex(100000, 0);
        output += Tester.assertEquals(s1.getEndTime(), 100000, "", false);
        output += Tester.assertEquals(s2.getStart(), 100000, "", false);
        track.shiftSectionEndsIndex(180000, 0);
        output += Tester.assertEquals(s1.getEndTime(), 180000, "", false);
        output += Tester.assertEquals(s2.getStart(), 180000, "", false);

        track.shiftSectionEndsIndex(1000, 0);
        output += Tester.assertEquals(s1.getEndTime(), 2000, "", false);
        output += Tester.assertEquals(s2.getStart(), 2000, "", false);
        track.shiftSectionEndsIndex(0, 0);
        output += Tester.assertEquals(s1.getEndTime(), 2000, "", false);
        output += Tester.assertEquals(s2.getStart(), 2000, "", false);

        track.shiftSectionEndsIndex(219000, 0);
        output += Tester.assertEquals(s1.getEndTime(), 218000, "", false);
        output += Tester.assertEquals(s2.getStart(), 218000, "", false);
        track.shiftSectionEndsIndex(240000, 0);
        output += Tester.assertEquals(s1.getEndTime(), 218000, "", false);
        output += Tester.assertEquals(s2.getStart(), 218000, "", false);

        
        track.shiftSectionEndsIndex(239000, 2);
        output += Tester.assertEquals(track.sectionCount(), 4);
        output += Tester.assertEquals(track.getSection(-1).getStart(), 238000);
        output += Tester.assertEquals(track.getSectionFromMilli(240000), 3);
        track.shiftSectionEndsIndex(230000, 2);
        output += Tester.assertEquals(track.sectionCount(), 4);
        output += Tester.assertEquals(s3.getEndTime(), 230000);
        output += Tester.assertEquals(track.getSectionFromMilli(240000), 3);
        track.shiftSectionEndsIndex(240000, 2);
        output += Tester.assertEquals(s3.getEndTime(), 238000);
        output += Tester.assertEquals(track.getSectionFromMilli(238100), 3);
        
        return output;
    }
    //TODO testExtendSectionToTimestamp
    testExtendSectionToTimestamp() {
        var s1 = new SongSection("A", 0, 120000, 120000, "4:4");
        var s2 = new SongSection("B", 120000, 200000, 120000, "4:4");
        var s3 = new SongSection("C", 200000, 240000, 120000, "4:4");
        var track = this.defaultTrack.copy();
        track.setSections([s1, s2, s3]);

        var testTrack = track.copy();

        var output = "";

        //Test just shifting the section, not overwriting
        testTrack.extendSectionToTimestamp(140000);
        output += Tester.assertEquals(testTrack.sectionList[0].getEndTime(), 140000);
        output += Tester.assertEquals(testTrack.sectionList[1].getStart(), 140000);
        testTrack.extendSectionToTimestamp(100000);
        output += Tester.assertEquals(testTrack.sectionList[0].getEndTime(), 100000);
        output += Tester.assertEquals(testTrack.sectionList[1].getStart(), 100000);

        //Test overwriting
        testTrack.extendSectionToTimestamp(200000);
        output += Tester.assertEquals(testTrack.sectionList[0].getEndTime(), 200000);
        output += Tester.assertEquals(testTrack.sectionList[1].getStart(), 200000);
        output += Tester.assertEquals(testTrack.sectionList.length, 2);

        testTrack = track.copy();
        testTrack.extendSectionToTimestamp(220000, 0);
        output += Tester.assertEquals(testTrack.sectionList[0].getEndTime(), 220000);
        output += Tester.assertEquals(testTrack.sectionList[1].getStart(), 220000);
        output += Tester.assertEquals(testTrack.sectionList.length, 2);

        testTrack = track.copy();
        testTrack.extendSectionToTimestamp(240000, 0);
        output += Tester.assertEquals(testTrack.sectionList[0].getEndTime(), 240000);
        output += Tester.assertEquals(testTrack.sectionList.length, 1);

        testTrack = track.copy();
        testTrack.extendSectionToTimestamp(230000, 2);
        output += Tester.assertEquals(testTrack.sectionCount(), 4);
        // output += Tester.assertEquals(testTrack.getSection(-1).getStart(), 230000);

        return output;
    }
    //TODO testAddSection
    testAddSectionAfter() {
        var track = this.defaultTrack.copy();
        var output = "";

        console.log("default len: " + this.defaultTrack.getLength());
        track.addSectionAfter("A", SectionType.A, 120000, 240000, false, 120, "4:4", true);
        output += Tester.assertEquals(track.sectionCount(), 2);
        output += Tester.assertEquals(track.getSection(1).getStart(), 120000);

        track = this.defaultTrack.copy();
        track.addSectionAfter("A", SectionType.A, 120000, 200000);
        output += Tester.assertEquals(track.sectionCount(), 3);
        output += Tester.assertEquals(track.getSection(1).getStart(), 120000);
        output += Tester.assertEquals(track.getSection(1).getEndTime(), 200000);
        output += Tester.assertEquals(track.getSection(2).getStart(), 200000);

        track = this.defaultTrack.copy();
        track.addSectionAfter("A", SectionType.A, 120000, 239000);
        output += Tester.assertEquals(track.sectionCount(), 3);
        output += Tester.assertEquals(track.getSection(1).getEndTime(), 238000);
        output += Tester.assertEquals(track.getSection(2).getStart(), 238000);

        track = this.defaultTrack.copy();
        track.addSectionAfter("A", SectionType.A, 1, 200000);
        output += Tester.assertEquals(track.sectionCount(), 3);
        output += Tester.assertEquals(track.getSection(1).getStart(), 2000);

        track = this.defaultTrack.copy();
        var s1 = new SongSection("A", 0, 120000, 120, "4:4");
        var s2 = new SongSection("B", 120000, 122000, 120, "4:4");
        var s3 = new SongSection("C", 122000, 124000, 120, "4:4");
        var s4 = new SongSection("D", 124000, 240000, 120, "4:4");
        track.setSections([s1, s2, s3, s4]);
        var testTrack = track.copy();
        output += testTrack.addSectionAfter("E", SectionType.E, 119000, 125000);
        output += Tester.assertEquals(testTrack.sectionCount(), 3);
        output += Tester.assertEquals(testTrack.getSection(0).getStart(), 0);
        output += Tester.assertEquals(testTrack.getSection(0).getEndTime(), 119000);
        output += Tester.assertEquals(testTrack.getSection(1).getStart(), 119000);
        output += Tester.assertEquals(testTrack.getSection(1).getEndTime(), 125000);
        output += Tester.assertEquals(testTrack.getSection(2).getStart(), 125000);

        testTrack = track.copy(); 
        output += testTrack.addSectionAfter("E", SectionType.E, 119000, 124000, false);
        output += Tester.assertEquals(testTrack.sectionCount(), 3);
        output += Tester.assertEquals(testTrack.getSection(0).getStart(), 0);
        output += Tester.assertEquals(testTrack.getSection(0).getEndTime(), 119000);
        output += Tester.assertEquals(testTrack.getSection(1).getStart(), 119000);
        output += Tester.assertEquals(testTrack.getSection(1).getEndTime(), 124000);
        output += Tester.assertEquals(testTrack.getSection(2).getStart(), 124000);

        testTrack = track.copy(); 
        output += testTrack.addSectionAfter("E", SectionType.E, 120000, 124000);
        output += Tester.assertEquals(testTrack.sectionCount(), 3);
        output += Tester.assertEquals(testTrack.getSection(0).getStart(), 0);
        output += Tester.assertEquals(testTrack.getSection(0).getEndTime(), 120000);
        output += Tester.assertEquals(testTrack.getSection(1).getStart(), 120000);
        output += Tester.assertEquals(testTrack.getSection(1).getEndTime(), 124000);
        output += Tester.assertEquals(testTrack.getSection(2).getStart(), 124000);

        return output;
    }
    //TODO testAddSectionBefore
    testAddSectionBefore() {
        var track = this.defaultTrack.copy();
        var s1 = new SongSection("A", 0, 120000, 120, "4:4");
        var s2 = new SongSection("B", 120000, 122000, 120, "4:4");
        var s3 = new SongSection("C", 122000, 124000, 120, "4:4");
        var s4 = new SongSection("D", 124000, 240000, 120, "4:4");
        track.setSections([s1, s2, s3, s4]);
        var testTrack: Track;
        var output = "";
        
        //Add while still within first section
        var testTrack = track.copy();
        testTrack.addSectionAtBeggining("AA", SectionType.A, 100000);
        output += Tester.assertEquals(testTrack.sectionCount(), 5);
        output += Tester.assertEquals(testTrack.getSection(0).getEndTime(), 100000);
        output += Tester.assertEquals(testTrack.getSection(1).getStart(), 100000);

        var testTrack = track.copy();
        testTrack.addSectionAtBeggining("AA", SectionType.A, 119000);
        output += Tester.assertEquals(testTrack.sectionCount(), 5);
        output += Tester.assertEquals(testTrack.getSection(0).getEndTime(), 118000);
        output += Tester.assertEquals(testTrack.getSection(1).getStart(), 118000);
        
        var testTrack = track.copy();
        testTrack.addSectionAtBeggining("AA", SectionType.A, 1);
        output += Tester.assertEquals(testTrack.sectionCount(), 5);
        output += Tester.assertEquals(testTrack.getSection(0).getEndTime(), 2000);
        output += Tester.assertEquals(testTrack.getSection(1).getStart(), 2000);

        //Add ontop of first section
        var testTrack = track.copy();
        testTrack.addSectionAtBeggining("AA", SectionType.A, 120000);
        output += Tester.assertEquals(testTrack.sectionCount(), 4);
        output += Tester.assertEquals(testTrack.getSection(0).getEndTime(), 120000);
        output += Tester.assertEquals(testTrack.getSection(1).getStart(), 120000);

        //Add beyond first section
        var testTrack = track.copy();
        testTrack.addSectionAtBeggining("AA", SectionType.A, 125000, false);
        output += Tester.assertEquals(testTrack.sectionCount(), 2);
        output += Tester.assertEquals(testTrack.getSection(0).getEndTime(), 125000);
        output += Tester.assertEquals(testTrack.getSection(1).getStart(), 125000);
        var testTrack = track.copy();
        testTrack.addSectionAtBeggining("AA", SectionType.A, 240000);
        output += Tester.assertEquals(testTrack.sectionCount(), 1);
        output += Tester.assertEquals(testTrack.getSection(0).getEndTime(), 240000);

        return output;
    }
}

export class TestWhatever extends Tester {
    doLog2() {
        var output = "";

        output += this.twoness(1) + "\n";
        output += this.twoness(2) + "\n";
        output += this.twoness(3) + "\n";
        output += this.twoness(4) + "\n";
        output += this.twoness(5) + "\n";
        output += this.twoness(6) + "\n";
        output += this.twoness(7) + "\n";
        output += this.twoness(8) + "\n";
        output += Math.log2(0) + "\n";
        output += Math.log2(0.25) + "\n";
        output += Math.log2(0.5) + "\n";
        output += Math.log2(0.75) + "\n";
        output += Math.log2(1) + "\n";
        output += Math.log2(2) + "\n";
        output += Math.log2(3) + "\n";
        output += Math.log2(4) + "\n";
        output += Math.log2(5) + "\n";
        output += Math.log2(6) + "\n";
        output += Math.log2(7) + "\n";
        output += Math.log2(8) + "\n";
        
        

        var section = new SongSection("Dope", 0, 20, 120, "4:4", SectionType.Chorus);
        output += Tester.assertEquals(section.getType(), SectionType.Chorus);
        

        return output;
    }
    twelveBarBlues() {
        var output = "";
        var blues12 = new Track(Source.AppleMusic, "", ""); 
        blues12.setSections([new SongSection("A", 0, 24000, 120000, "4:4", SectionType.A)])
        blues12.addSection("B", SectionType.B, 8000, 12000);
        blues12.addSection("A2", SectionType.A, 12000, 16000);
        blues12.addSection("C", SectionType.C, 16000, 18000);
        blues12.addSection("B2", SectionType.B, 18000, 20000);

        for(var i = 0; i<blues12.sectionCount(); i++) {
            output += i + ", " + blues12.getSection(i).getName() + ": " + blues12.getSection(i).getEndTime() + "\n";
        }
        return output;
    }
    twoness(j: number) {
        var twoness = 0;
        var temp = j;
        while(temp/2 % 1 == 0) {
            twoness++;
            temp/=2;
        }
        return twoness;
    }
}
(function () {

    var debug = false;

    var root = this;

    var EXIF = function (obj) {
        if (obj instanceof EXIF) return obj;
        if (!(this instanceof EXIF)) return new EXIF(obj);
        this.EXIFwrapped = obj;
    };

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = EXIF;
        }
        exports.EXIF = EXIF;
    } else {
        root.EXIF = EXIF;
    }

    var ExifTags = EXIF.Tags = {

        // version tags
        0x9000: "ExifVersion",             // EXIF version
        0xA000: "FlashpixVersion",         // Flashpix format version

        // colorspace tags
        0xA001: "ColorSpace",              // Color space information tag

        // image configuration
        0xA002: "PixelXDimension",         // Valid width of meaningful image
        0xA003: "PixelYDimension",         // Valid height of meaningful image
        0x9101: "ComponentsConfiguration", // Information about channels
        0x9102: "CompressedBitsPerPixel",  // Compressed bits per pixel

        // user information
        0x927C: "MakerNote",               // Any desired information written by the manufacturer
        0x9286: "UserComment",             // Comments by user

        // related file
        0xA004: "RelatedSoundFile",        // Name of related sound file

        // date and time
        0x9003: "DateTimeOriginal",        // Date and time when the original image was generated
        0x9004: "DateTimeDigitized",       // Date and time when the image was stored digitally
        0x9290: "SubsecTime",              // Fractions of seconds for DateTime
        0x9291: "SubsecTimeOriginal",      // Fractions of seconds for DateTimeOriginal
        0x9292: "SubsecTimeDigitized",     // Fractions of seconds for DateTimeDigitized

        // picture-taking conditions
        0x829A: "ExposureTime",            // Exposure time (in seconds)
        0x829D: "FNumber",                 // F number
        0x8822: "ExposureProgram",         // Exposure program
        0x8824: "SpectralSensitivity",     // Spectral sensitivity
        0x8827: "ISOSpeedRatings",         // ISO speed rating
        0x8828: "OECF",                    // Optoelectric conversion factor
        0x9201: "ShutterSpeedValue",       // Shutter speed
        0x9202: "ApertureValue",           // Lens aperture
        0x9203: "BrightnessValue",         // Value of brightness
        0x9204: "ExposureBias",            // Exposure bias
        0x9205: "MaxApertureValue",        // Smallest F number of lens
        0x9206: "SubjectDistance",         // Distance to subject in meters
        0x9207: "MeteringMode",            // Metering mode
        0x9208: "LightSource",             // Kind of light source
        0x9209: "Flash",                   // Flash status
        0x9214: "SubjectArea",             // Location and area of main subject
        0x920A: "FocalLength",             // Focal length of the lens in mm
        0xA20B: "FlashEnergy",             // Strobe energy in BCPS
        0xA20C: "SpatialFrequencyResponse",    //
        0xA20E: "FocalPlaneXResolution",   // Number of pixels in width direction per FocalPlaneResolutionUnit
        0xA20F: "FocalPlaneYResolution",   // Number of pixels in height direction per FocalPlaneResolutionUnit
        0xA210: "FocalPlaneResolutionUnit",    // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
        0xA214: "SubjectLocation",         // Location of subject in image
        0xA215: "ExposureIndex",           // Exposure index selected on camera
        0xA217: "SensingMethod",           // Image sensor type
        0xA300: "FileSource",              // Image source (3 == DSC)
        0xA301: "SceneType",               // Scene type (1 == directly photographed)
        0xA302: "CFAPattern",              // Color filter array geometric pattern
        0xA401: "CustomRendered",          // Special processing
        0xA402: "ExposureMode",            // Exposure mode
        0xA403: "WhiteBalance",            // 1 = auto white balance, 2 = manual
        0xA404: "DigitalZoomRation",       // Digital zoom ratio
        0xA405: "FocalLengthIn35mmFilm",   // Equivalent foacl length assuming 35mm film camera (in mm)
        0xA406: "SceneCaptureType",        // Type of scene
        0xA407: "GainControl",             // Degree of overall image gain adjustment
        0xA408: "Contrast",                // Direction of contrast processing applied by camera
        0xA409: "Saturation",              // Direction of saturation processing applied by camera
        0xA40A: "Sharpness",               // Direction of sharpness processing applied by camera
        0xA40B: "DeviceSettingDescription",    //
        0xA40C: "SubjectDistanceRange",    // Distance to subject

        // other tags
        0xA005: "InteroperabilityIFDPointer",
        0xA420: "ImageUniqueID"            // Identifier assigned uniquely to each image
    };

    var TiffTags = EXIF.TiffTags = {
        0x0100: "ImageWidth",
        0x0101: "ImageHeight",
        0x8769: "ExifIFDPointer",
        0x8825: "GPSInfoIFDPointer",
        0xA005: "InteroperabilityIFDPointer",
        0x0102: "BitsPerSample",
        0x0103: "Compression",
        0x0106: "PhotometricInterpretation",
        0x0112: "Orientation",
        0x0115: "SamplesPerPixel",
        0x011C: "PlanarConfiguration",
        0x0212: "YCbCrSubSampling",
        0x0213: "YCbCrPositioning",
        0x011A: "XResolution",
        0x011B: "YResolution",
        0x0128: "ResolutionUnit",
        0x0111: "StripOffsets",
        0x0116: "RowsPerStrip",
        0x0117: "StripByteCounts",
        0x0201: "JPEGInterchangeFormat",
        0x0202: "JPEGInterchangeFormatLength",
        0x012D: "TransferFunction",
        0x013E: "WhitePoint",
        0x013F: "PrimaryChromaticities",
        0x0211: "YCbCrCoefficients",
        0x0214: "ReferenceBlackWhite",
        0x0132: "DateTime",
        0x010E: "ImageDescription",
        0x010F: "Make",
        0x0110: "Model",
        0x0131: "Software",
        0x013B: "Artist",
        0x8298: "Copyright"
    };

    var GPSTags = EXIF.GPSTags = {
        0x0000: "GPSVersionID",
        0x0001: "GPSLatitudeRef",
        0x0002: "GPSLatitude",
        0x0003: "GPSLongitudeRef",
        0x0004: "GPSLongitude",
        0x0005: "GPSAltitudeRef",
        0x0006: "GPSAltitude",
        0x0007: "GPSTimeStamp",
        0x0008: "GPSSatellites",
        0x0009: "GPSStatus",
        0x000A: "GPSMeasureMode",
        0x000B: "GPSDOP",
        0x000C: "GPSSpeedRef",
        0x000D: "GPSSpeed",
        0x000E: "GPSTrackRef",
        0x000F: "GPSTrack",
        0x0010: "GPSImgDirectionRef",
        0x0011: "GPSImgDirection",
        0x0012: "GPSMapDatum",
        0x0013: "GPSDestLatitudeRef",
        0x0014: "GPSDestLatitude",
        0x0015: "GPSDestLongitudeRef",
        0x0016: "GPSDestLongitude",
        0x0017: "GPSDestBearingRef",
        0x0018: "GPSDestBearing",
        0x0019: "GPSDestDistanceRef",
        0x001A: "GPSDestDistance",
        0x001B: "GPSProcessingMethod",
        0x001C: "GPSAreaInformation",
        0x001D: "GPSDateStamp",
        0x001E: "GPSDifferential"
    };

    // EXIF 2.3 Spec
    var IFD1Tags = EXIF.IFD1Tags = {
        0x0100: "ImageWidth",
        0x0101: "ImageHeight",
        0x0102: "BitsPerSample",
        0x0103: "Compression",
        0x0106: "PhotometricInterpretation",
        0x0111: "StripOffsets",
        0x0112: "Orientation",
        0x0115: "SamplesPerPixel",
        0x0116: "RowsPerStrip",
        0x0117: "StripByteCounts",
        0x011A: "XResolution",
        0x011B: "YResolution",
        0x011C: "PlanarConfiguration",
        0x0128: "ResolutionUnit",
        0x0201: "JpegIFOffset",    // When image format is JPEG, this value show offset to JPEG data stored.(aka "ThumbnailOffset" or "JPEGInterchangeFormat")
        0x0202: "JpegIFByteCount", // When image format is JPEG, this value shows data size of JPEG image (aka "ThumbnailLength" or "JPEGInterchangeFormatLength")
        0x0211: "YCbCrCoefficients",
        0x0212: "YCbCrSubSampling",
        0x0213: "YCbCrPositioning",
        0x0214: "ReferenceBlackWhite"
    };

    var StringValues = EXIF.StringValues = {
        ExposureProgram: {
            0: "Not defined",
            1: "Manual",
            2: "Normal program",
            3: "Aperture priority",
            4: "Shutter priority",
            5: "Creative program",
            6: "Action program",
            7: "Portrait mode",
            8: "Landscape mode"
        },
        MeteringMode: {
            0: "Unknown",
            1: "Average",
            2: "CenterWeightedAverage",
            3: "Spot",
            4: "MultiSpot",
            5: "Pattern",
            6: "Partial",
            255: "Other"
        },
        LightSource: {
            0: "Unknown",
            1: "Daylight",
            2: "Fluorescent",
            3: "Tungsten (incandescent light)",
            4: "Flash",
            9: "Fine weather",
            10: "Cloudy weather",
            11: "Shade",
            12: "Daylight fluorescent (D 5700 - 7100K)",
            13: "Day white fluorescent (N 4600 - 5400K)",
            14: "Cool white fluorescent (W 3900 - 4500K)",
            15: "White fluorescent (WW 3200 - 3700K)",
            17: "Standard light A",
            18: "Standard light B",
            19: "Standard light C",
            20: "D55",
            21: "D65",
            22: "D75",
            23: "D50",
            24: "ISO studio tungsten",
            255: "Other"
        },
        Flash: {
            0x0000: "Flash did not fire",
            0x0001: "Flash fired",
            0x0005: "Strobe return light not detected",
            0x0007: "Strobe return light detected",
            0x0009: "Flash fired, compulsory flash mode",
            0x000D: "Flash fired, compulsory flash mode, return light not detected",
            0x000F: "Flash fired, compulsory flash mode, return light detected",
            0x0010: "Flash did not fire, compulsory flash mode",
            0x0018: "Flash did not fire, auto mode",
            0x0019: "Flash fired, auto mode",
            0x001D: "Flash fired, auto mode, return light not detected",
            0x001F: "Flash fired, auto mode, return light detected",
            0x0020: "No flash function",
            0x0041: "Flash fired, red-eye reduction mode",
            0x0045: "Flash fired, red-eye reduction mode, return light not detected",
            0x0047: "Flash fired, red-eye reduction mode, return light detected",
            0x0049: "Flash fired, compulsory flash mode, red-eye reduction mode",
            0x004D: "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
            0x004F: "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
            0x0059: "Flash fired, auto mode, red-eye reduction mode",
            0x005D: "Flash fired, auto mode, return light not detected, red-eye reduction mode",
            0x005F: "Flash fired, auto mode, return light detected, red-eye reduction mode"
        },
        SensingMethod: {
            1: "Not defined",
            2: "One-chip color area sensor",
            3: "Two-chip color area sensor",
            4: "Three-chip color area sensor",
            5: "Color sequential area sensor",
            7: "Trilinear sensor",
            8: "Color sequential linear sensor"
        },
        SceneCaptureType: {
            0: "Standard",
            1: "Landscape",
            2: "Portrait",
            3: "Night scene"
        },
        SceneType: {
            1: "Directly photographed"
        },
        CustomRendered: {
            0: "Normal process",
            1: "Custom process"
        },
        WhiteBalance: {
            0: "Auto white balance",
            1: "Manual white balance"
        },
        GainControl: {
            0: "None",
            1: "Low gain up",
            2: "High gain up",
            3: "Low gain down",
            4: "High gain down"
        },
        Contrast: {
            0: "Normal",
            1: "Soft",
            2: "Hard"
        },
        Saturation: {
            0: "Normal",
            1: "Low saturation",
            2: "High saturation"
        },
        Sharpness: {
            0: "Normal",
            1: "Soft",
            2: "Hard"
        },
        SubjectDistanceRange: {
            0: "Unknown",
            1: "Macro",
            2: "Close view",
            3: "Distant view"
        },
        FileSource: {
            3: "DSC"
        },

        Components: {
            0: "",
            1: "Y",
            2: "Cb",
            3: "Cr",
            4: "R",
            5: "G",
            6: "B"
        }
    };

    function addEvent(element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + event, handler);
        }
    }

    function imageHasData(img) {
        return !!(img.exifdata);
    }


    function base64ToArrayBuffer(base64, contentType) {
        contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
        base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
        var binary = atob(base64);
        var len = binary.length;
        var buffer = new ArrayBuffer(len);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
        }
        return buffer;
    }

    function objectURLToBlob(url, callback) {
        var http = new XMLHttpRequest();
        http.open("GET", url, true);
        http.responseType = "blob";
        http.onload = function (e) {
            if (this.status == 200 || this.status === 0) {
                callback(this.response);
            }
        };
        http.send();
    }

    function getImageData(img, callback) {
        function handleBinaryFile(binFile) {
            var data = findEXIFinJPEG(binFile);
            img.exifdata = data || {};
            var iptcdata = findIPTCinJPEG(binFile);
            img.iptcdata = iptcdata || {};
            if (EXIF.isXmpEnabled) {
                var xmpdata = findXMPinJPEG(binFile);
                img.xmpdata = xmpdata || {};
            }
            if (callback) {
                callback.call(img);
            }
        }

        if (img.src) {
            if (/^data\:/i.test(img.src)) { // Data URI
                var arrayBuffer = base64ToArrayBuffer(img.src);
                handleBinaryFile(arrayBuffer);

            } else if (/^blob\:/i.test(img.src)) { // Object URL
                var fileReader = new FileReader();
                fileReader.onload = function (e) {
                    handleBinaryFile(e.target.result);
                };
                objectURLToBlob(img.src, function (blob) {
                    fileReader.readAsArrayBuffer(blob);
                });
            } else {
                var http = new XMLHttpRequest();
                http.onload = function () {
                    if (this.status == 200 || this.status === 0) {
                        handleBinaryFile(http.response);
                    } else {
                        throw "Could not load image";
                    }
                    http = null;
                };
                http.open("GET", img.src, true);
                http.responseType = "arraybuffer";
                http.send(null);
            }
        } else if (self.FileReader && (img instanceof self.Blob || img instanceof self.File)) {
            var fileReader = new FileReader();
            fileReader.onload = function (e) {
                if (debug) console.log("Got file of length " + e.target.result.byteLength);
                handleBinaryFile(e.target.result);
            };

            fileReader.readAsArrayBuffer(img);
        }
    }

    function findEXIFinJPEG(file) {
        var dataView = new DataView(file);

        if (debug) console.log("Got file of length " + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            if (debug) console.log("Not a valid JPEG");
            return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.byteLength,
            marker;

        while (offset < length) {
            if (dataView.getUint8(offset) != 0xFF) {
                if (debug) console.log("Not a valid marker at offset " + offset + ", found: " + dataView.getUint8(offset));
                return false; // not a valid marker, something is wrong
            }

            marker = dataView.getUint8(offset + 1);
            if (debug) console.log(marker);

            // we could implement handling for other markers here,
            // but we're only looking for 0xFFE1 for EXIF data

            if (marker == 225) {
                if (debug) console.log("Found 0xFFE1 marker");

                return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);

                // offset += 2 + file.getShortAt(offset+2, true);

            } else {
                offset += 2 + dataView.getUint16(offset + 2);
            }

        }

    }

    function findIPTCinJPEG(file) {
        var dataView = new DataView(file);

        if (debug) console.log("Got file of length " + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            if (debug) console.log("Not a valid JPEG");
            return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.byteLength;


        var isFieldSegmentStart = function (dataView, offset) {
            return (
                dataView.getUint8(offset) === 0x38 &&
                dataView.getUint8(offset + 1) === 0x42 &&
                dataView.getUint8(offset + 2) === 0x49 &&
                dataView.getUint8(offset + 3) === 0x4D &&
                dataView.getUint8(offset + 4) === 0x04 &&
                dataView.getUint8(offset + 5) === 0x04
            );
        };

        while (offset < length) {

            if (isFieldSegmentStart(dataView, offset)) {

                // Get the length of the name header (which is padded to an even number of bytes)
                var nameHeaderLength = dataView.getUint8(offset + 7);
                if (nameHeaderLength % 2 !== 0) nameHeaderLength += 1;
                // Check for pre photoshop 6 format
                if (nameHeaderLength === 0) {
                    // Always 4
                    nameHeaderLength = 4;
                }

                var startOffset = offset + 8 + nameHeaderLength;
                var sectionLength = dataView.getUint16(offset + 6 + nameHeaderLength);

                return readIPTCData(file, startOffset, sectionLength);

                break;

            }


            // Not the marker, continue searching
            offset++;

        }

    }
    var IptcFieldMap = {
        0x78: 'caption',
        0x6E: 'credit',
        0x19: 'keywords',
        0x37: 'dateCreated',
        0x50: 'byline',
        0x55: 'bylineTitle',
        0x7A: 'captionWriter',
        0x69: 'headline',
        0x74: 'copyright',
        0x0F: 'category'
    };
    function readIPTCData(file, startOffset, sectionLength) {
        var dataView = new DataView(file);
        var data = {};
        var fieldValue, fieldName, dataSize, segmentType, segmentSize;
        var segmentStartPos = startOffset;
        while (segmentStartPos < startOffset + sectionLength) {
            if (dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos + 1) === 0x02) {
                segmentType = dataView.getUint8(segmentStartPos + 2);
                if (segmentType in IptcFieldMap) {
                    dataSize = dataView.getInt16(segmentStartPos + 3);
                    segmentSize = dataSize + 5;
                    fieldName = IptcFieldMap[segmentType];
                    fieldValue = getStringFromDB(dataView, segmentStartPos + 5, dataSize);
                    // Check if we already stored a value with this name
                    if (data.hasOwnProperty(fieldName)) {
                        // Value already stored with this name, create multivalue field
                        if (data[fieldName] instanceof Array) {
                            data[fieldName].push(fieldValue);
                        }
                        else {
                            data[fieldName] = [data[fieldName], fieldValue];
                        }
                    }
                    else {
                        data[fieldName] = fieldValue;
                    }
                }

            }
            segmentStartPos++;
        }
        return data;
    }



    function readTags(file, tiffStart, dirStart, strings, bigEnd) {
        var entries = file.getUint16(dirStart, !bigEnd),
            tags = {},
            entryOffset, tag,
            i;

        for (i = 0; i < entries; i++) {
            entryOffset = dirStart + i * 12 + 2;
            tag = strings[file.getUint16(entryOffset, !bigEnd)];
            if (!tag && debug) console.log("Unknown tag: " + file.getUint16(entryOffset, !bigEnd));
            tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
        }
        return tags;
    }


    function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
        var type = file.getUint16(entryOffset + 2, !bigEnd),
            numValues = file.getUint32(entryOffset + 4, !bigEnd),
            valueOffset = file.getUint32(entryOffset + 8, !bigEnd) + tiffStart,
            offset,
            vals, val, n,
            numerator, denominator;

        switch (type) {
            case 1: // byte, 8-bit unsigned int
            case 7: // undefined, 8-bit byte, value depending on field
                if (numValues == 1) {
                    return file.getUint8(entryOffset + 8, !bigEnd);
                } else {
                    offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n = 0; n < numValues; n++) {
                        vals[n] = file.getUint8(offset + n);
                    }
                    return vals;
                }

            case 2: // ascii, 8-bit byte
                offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                return getStringFromDB(file, offset, numValues - 1);

            case 3: // short, 16 bit int
                if (numValues == 1) {
                    return file.getUint16(entryOffset + 8, !bigEnd);
                } else {
                    offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n = 0; n < numValues; n++) {
                        vals[n] = file.getUint16(offset + 2 * n, !bigEnd);
                    }
                    return vals;
                }

            case 4: // long, 32 bit int
                if (numValues == 1) {
                    return file.getUint32(entryOffset + 8, !bigEnd);
                } else {
                    vals = [];
                    for (n = 0; n < numValues; n++) {
                        vals[n] = file.getUint32(valueOffset + 4 * n, !bigEnd);
                    }
                    return vals;
                }

            case 5:    // rational = two long values, first is numerator, second is denominator
                if (numValues == 1) {
                    numerator = file.getUint32(valueOffset, !bigEnd);
                    denominator = file.getUint32(valueOffset + 4, !bigEnd);
                    val = new Number(numerator / denominator);
                    val.numerator = numerator;
                    val.denominator = denominator;
                    return val;
                } else {
                    vals = [];
                    for (n = 0; n < numValues; n++) {
                        numerator = file.getUint32(valueOffset + 8 * n, !bigEnd);
                        denominator = file.getUint32(valueOffset + 4 + 8 * n, !bigEnd);
                        vals[n] = new Number(numerator / denominator);
                        vals[n].numerator = numerator;
                        vals[n].denominator = denominator;
                    }
                    return vals;
                }

            case 9: // slong, 32 bit signed int
                if (numValues == 1) {
                    return file.getInt32(entryOffset + 8, !bigEnd);
                } else {
                    vals = [];
                    for (n = 0; n < numValues; n++) {
                        vals[n] = file.getInt32(valueOffset + 4 * n, !bigEnd);
                    }
                    return vals;
                }

            case 10: // signed rational, two slongs, first is numerator, second is denominator
                if (numValues == 1) {
                    return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset + 4, !bigEnd);
                } else {
                    vals = [];
                    for (n = 0; n < numValues; n++) {
                        vals[n] = file.getInt32(valueOffset + 8 * n, !bigEnd) / file.getInt32(valueOffset + 4 + 8 * n, !bigEnd);
                    }
                    return vals;
                }
        }
    }

    /**
    * Given an IFD (Image File Directory) start offset
    * returns an offset to next IFD or 0 if it's the last IFD.
    */
    function getNextIFDOffset(dataView, dirStart, bigEnd) {
        //the first 2bytes means the number of directory entries contains in this IFD
        var entries = dataView.getUint16(dirStart, !bigEnd);

        // After last directory entry, there is a 4bytes of data,
        // it means an offset to next IFD.
        // If its value is '0x00000000', it means this is the last IFD and there is no linked IFD.

        return dataView.getUint32(dirStart + 2 + entries * 12, !bigEnd); // each entry is 12 bytes long
    }

    function readThumbnailImage(dataView, tiffStart, firstIFDOffset, bigEnd) {
        // get the IFD1 offset
        var IFD1OffsetPointer = getNextIFDOffset(dataView, tiffStart + firstIFDOffset, bigEnd);

        if (!IFD1OffsetPointer) {
            // console.log('******** IFD1Offset is empty, image thumb not found ********');
            return {};
        }
        else if (IFD1OffsetPointer > dataView.byteLength) { // this should not happen
            // console.log('******** IFD1Offset is outside the bounds of the DataView ********');
            return {};
        }
        // console.log('*******  thumbnail IFD offset (IFD1) is: %s', IFD1OffsetPointer);

        var thumbTags = readTags(dataView, tiffStart, tiffStart + IFD1OffsetPointer, IFD1Tags, bigEnd)

        // EXIF 2.3 specification for JPEG format thumbnail

        // If the value of Compression(0x0103) Tag in IFD1 is '6', thumbnail image format is JPEG.
        // Most of Exif image uses JPEG format for thumbnail. In that case, you can get offset of thumbnail
        // by JpegIFOffset(0x0201) Tag in IFD1, size of thumbnail by JpegIFByteCount(0x0202) Tag.
        // Data format is ordinary JPEG format, starts from 0xFFD8 and ends by 0xFFD9. It seems that
        // JPEG format and 160x120pixels of size are recommended thumbnail format for Exif2.1 or later.

        if (thumbTags['Compression']) {
            // console.log('Thumbnail image found!');

            switch (thumbTags['Compression']) {
                case 6:
                    // console.log('Thumbnail image format is JPEG');
                    if (thumbTags.JpegIFOffset && thumbTags.JpegIFByteCount) {
                        // extract the thumbnail
                        var tOffset = tiffStart + thumbTags.JpegIFOffset;
                        var tLength = thumbTags.JpegIFByteCount;
                        thumbTags['blob'] = new Blob([new Uint8Array(dataView.buffer, tOffset, tLength)], {
                            type: 'image/jpeg'
                        });
                    }
                    break;

                case 1:
                    console.log("Thumbnail image format is TIFF, which is not implemented.");
                    break;
                default:
                    console.log("Unknown thumbnail image format '%s'", thumbTags['Compression']);
            }
        }
        else if (thumbTags['PhotometricInterpretation'] == 2) {
            console.log("Thumbnail image format is RGB, which is not implemented.");
        }
        return thumbTags;
    }

    function getStringFromDB(buffer, start, length) {
        var outstr = "";
        for (var n = start; n < start + length; n++) {
            outstr += String.fromCharCode(buffer.getUint8(n));
        }
        return outstr;
    }

    function readEXIFData(file, start) {
        if (getStringFromDB(file, start, 4) != "Exif") {
            if (debug) console.log("Not valid EXIF data! " + getStringFromDB(file, start, 4));
            return false;
        }

        var bigEnd,
            tags, tag,
            exifData, gpsData,
            tiffOffset = start + 6;

        // test for TIFF validity and endianness
        if (file.getUint16(tiffOffset) == 0x4949) {
            bigEnd = false;
        } else if (file.getUint16(tiffOffset) == 0x4D4D) {
            bigEnd = true;
        } else {
            if (debug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
            return false;
        }

        if (file.getUint16(tiffOffset + 2, !bigEnd) != 0x002A) {
            if (debug) console.log("Not valid TIFF data! (no 0x002A)");
            return false;
        }

        var firstIFDOffset = file.getUint32(tiffOffset + 4, !bigEnd);

        if (firstIFDOffset < 0x00000008) {
            if (debug) console.log("Not valid TIFF data! (First offset less than 8)", file.getUint32(tiffOffset + 4, !bigEnd));
            return false;
        }

        tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd);

        if (tags.ExifIFDPointer) {
            exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
            for (tag in exifData) {
                switch (tag) {
                    case "LightSource":
                    case "Flash":
                    case "MeteringMode":
                    case "ExposureProgram":
                    case "SensingMethod":
                    case "SceneCaptureType":
                    case "SceneType":
                    case "CustomRendered":
                    case "WhiteBalance":
                    case "GainControl":
                    case "Contrast":
                    case "Saturation":
                    case "Sharpness":
                    case "SubjectDistanceRange":
                    case "FileSource":
                        exifData[tag] = StringValues[tag][exifData[tag]];
                        break;

                    case "ExifVersion":
                    case "FlashpixVersion":
                        exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
                        break;

                    case "ComponentsConfiguration":
                        exifData[tag] =
                            StringValues.Components[exifData[tag][0]] +
                            StringValues.Components[exifData[tag][1]] +
                            StringValues.Components[exifData[tag][2]] +
                            StringValues.Components[exifData[tag][3]];
                        break;
                }
                tags[tag] = exifData[tag];
            }
        }

        if (tags.GPSInfoIFDPointer) {
            gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
            for (tag in gpsData) {
                switch (tag) {
                    case "GPSVersionID":
                        gpsData[tag] = gpsData[tag][0] +
                            "." + gpsData[tag][1] +
                            "." + gpsData[tag][2] +
                            "." + gpsData[tag][3];
                        break;
                }
                tags[tag] = gpsData[tag];
            }
        }

        // extract thumbnail
        tags['thumbnail'] = readThumbnailImage(file, tiffOffset, firstIFDOffset, bigEnd);

        return tags;
    }

    function findXMPinJPEG(file) {

        if (!('DOMParser' in self)) {
            // console.warn('XML parsing not supported without DOMParser');
            return;
        }
        var dataView = new DataView(file);

        if (debug) console.log("Got file of length " + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            if (debug) console.log("Not a valid JPEG");
            return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.byteLength,
            dom = new DOMParser();

        while (offset < (length - 4)) {
            if (getStringFromDB(dataView, offset, 4) == "http") {
                var startOffset = offset - 1;
                var sectionLength = dataView.getUint16(offset - 2) - 1;
                var xmpString = getStringFromDB(dataView, startOffset, sectionLength)
                var xmpEndIndex = xmpString.indexOf('xmpmeta>') + 8;
                xmpString = xmpString.substring(xmpString.indexOf('<x:xmpmeta'), xmpEndIndex);

                var indexOfXmp = xmpString.indexOf('x:xmpmeta') + 10
                //Many custom written programs embed xmp/xml without any namespace. Following are some of them.
                //Without these namespaces, XML is thought to be invalid by parsers
                xmpString = xmpString.slice(0, indexOfXmp)
                    + 'xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/" '
                    + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
                    + 'xmlns:tiff="http://ns.adobe.com/tiff/1.0/" '
                    + 'xmlns:plus="http://schemas.android.com/apk/lib/com.google.android.gms.plus" '
                    + 'xmlns:ext="http://www.gettyimages.com/xsltExtension/1.0" '
                    + 'xmlns:exif="http://ns.adobe.com/exif/1.0/" '
                    + 'xmlns:stEvt="http://ns.adobe.com/xap/1.0/sType/ResourceEvent#" '
                    + 'xmlns:stRef="http://ns.adobe.com/xap/1.0/sType/ResourceRef#" '
                    + 'xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/" '
                    + 'xmlns:xapGImg="http://ns.adobe.com/xap/1.0/g/img/" '
                    + 'xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" '
                    + xmpString.slice(indexOfXmp)

                var domDocument = dom.parseFromString(xmpString, 'text/xml');
                return xml2Object(domDocument);
            } else {
                offset++;
            }
        }
    }

    function xml2json(xml) {
        var json = {};

        if (xml.nodeType == 1) { // element node
            if (xml.attributes.length > 0) {
                json['@attributes'] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    json['@attributes'][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text node
            return xml.nodeValue;
        }

        // deal with children
        if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var child = xml.childNodes.item(i);
                var nodeName = child.nodeName;
                if (json[nodeName] == null) {
                    json[nodeName] = xml2json(child);
                } else {
                    if (json[nodeName].push == null) {
                        var old = json[nodeName];
                        json[nodeName] = [];
                        json[nodeName].push(old);
                    }
                    json[nodeName].push(xml2json(child));
                }
            }
        }

        return json;
    }

    function xml2Object(xml) {
        try {
            var obj = {};
            if (xml.children.length > 0) {
                for (var i = 0; i < xml.children.length; i++) {
                    var item = xml.children.item(i);
                    var attributes = item.attributes;
                    for (var idx in attributes) {
                        var itemAtt = attributes[idx];
                        var dataKey = itemAtt.nodeName;
                        var dataValue = itemAtt.nodeValue;

                        if (dataKey !== undefined) {
                            obj[dataKey] = dataValue;
                        }
                    }
                    var nodeName = item.nodeName;

                    if (typeof (obj[nodeName]) == "undefined") {
                        obj[nodeName] = xml2json(item);
                    } else {
                        if (typeof (obj[nodeName].push) == "undefined") {
                            var old = obj[nodeName];

                            obj[nodeName] = [];
                            obj[nodeName].push(old);
                        }
                        obj[nodeName].push(xml2json(item));
                    }
                }
            } else {
                obj = xml.textContent;
            }
            return obj;
        } catch (e) {
            console.log(e.message);
        }
    }

    EXIF.enableXmp = function () {
        EXIF.isXmpEnabled = true;
    }

    EXIF.disableXmp = function () {
        EXIF.isXmpEnabled = false;
    }

    EXIF.getData = function (img, callback) {
        if (((self.Image && img instanceof self.Image)
            || (self.HTMLImageElement && img instanceof self.HTMLImageElement))
            && !img.complete)
            return false;

        if (!imageHasData(img)) {
            getImageData(img, callback);
        } else {
            if (callback) {
                callback.call(img);
            }
        }
        return true;
    }

    EXIF.getTag = function (img, tag) {
        if (!imageHasData(img)) return;
        return img.exifdata[tag];
    }

    EXIF.getIptcTag = function (img, tag) {
        if (!imageHasData(img)) return;
        return img.iptcdata[tag];
    }

    EXIF.getAllTags = function (img) {
        if (!imageHasData(img)) return {};
        var a,
            data = img.exifdata,
            tags = {};
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                tags[a] = data[a];
            }
        }
        return tags;
    }

    EXIF.getAllIptcTags = function (img) {
        if (!imageHasData(img)) return {};
        var a,
            data = img.iptcdata,
            tags = {};
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                tags[a] = data[a];
            }
        }
        return tags;
    }

    EXIF.pretty = function (img) {
        if (!imageHasData(img)) return "";
        var a,
            data = img.exifdata,
            strPretty = "";
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                if (typeof data[a] == "object") {
                    if (data[a] instanceof Number) {
                        strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
                    } else {
                        strPretty += a + " : [" + data[a].length + " values]\r\n";
                    }
                } else {
                    strPretty += a + " : " + data[a] + "\r\n";
                }
            }
        }
        return strPretty;
    }

    EXIF.readFromBinaryFile = function (file) {
        return findEXIFinJPEG(file);
    }

    if (typeof define === 'function' && define.amd) {
        define('exif-js', [], function () {
            return EXIF;
        });
    }
}.call(this));



!function (e, t) { "function" == typeof define && define.amd ? define(t) : "object" == typeof exports && "string" != typeof exports.nodeName ? module.exports = t() : e.Croppie = t() }("undefined" != typeof self ? self : this, function () { "function" != typeof Promise && function (e) { function t(e, t) { return function () { e.apply(t, arguments) } } function i(e) { if ("object" != typeof this) throw new TypeError("Promises must be constructed via new"); if ("function" != typeof e) throw new TypeError("not a function"); this._state = null, this._value = null, this._deferreds = [], s(e, t(o, this), t(r, this)) } function n(e) { var t = this; return null === this._state ? void this._deferreds.push(e) : void h(function () { var i = t._state ? e.onFulfilled : e.onRejected; if (null !== i) { var n; try { n = i(t._value) } catch (t) { return void e.reject(t) } e.resolve(n) } else (t._state ? e.resolve : e.reject)(t._value) }) } function o(e) { try { if (e === this) throw new TypeError("A promise cannot be resolved with itself."); if (e && ("object" == typeof e || "function" == typeof e)) { var i = e.then; if ("function" == typeof i) return void s(t(i, e), t(o, this), t(r, this)) } this._state = !0, this._value = e, a.call(this) } catch (e) { r.call(this, e) } } function r(e) { this._state = !1, this._value = e, a.call(this) } function a() { for (var e = 0, t = this._deferreds.length; t > e; e++)n.call(this, this._deferreds[e]); this._deferreds = null } function s(e, t, i) { var n = !1; try { e(function (e) { n || (n = !0, t(e)) }, function (e) { n || (n = !0, i(e)) }) } catch (e) { if (n) return; n = !0, i(e) } } var l = setTimeout, h = "function" == typeof setImmediate && setImmediate || function (e) { l(e, 1) }, u = Array.isArray || function (e) { return "[object Array]" === Object.prototype.toString.call(e) }; i.prototype.catch = function (e) { return this.then(null, e) }, i.prototype.then = function (e, t) { var o = this; return new i(function (i, r) { n.call(o, new function (e, t, i, n) { this.onFulfilled = "function" == typeof e ? e : null, this.onRejected = "function" == typeof t ? t : null, this.resolve = i, this.reject = n }(e, t, i, r)) }) }, i.all = function () { var e = Array.prototype.slice.call(1 === arguments.length && u(arguments[0]) ? arguments[0] : arguments); return new i(function (t, i) { function n(r, a) { try { if (a && ("object" == typeof a || "function" == typeof a)) { var s = a.then; if ("function" == typeof s) return void s.call(a, function (e) { n(r, e) }, i) } e[r] = a, 0 == --o && t(e) } catch (e) { i(e) } } if (0 === e.length) return t([]); for (var o = e.length, r = 0; r < e.length; r++)n(r, e[r]) }) }, i.resolve = function (e) { return e && "object" == typeof e && e.constructor === i ? e : new i(function (t) { t(e) }) }, i.reject = function (e) { return new i(function (t, i) { i(e) }) }, i.race = function (e) { return new i(function (t, i) { for (var n = 0, o = e.length; o > n; n++)e[n].then(t, i) }) }, i._setImmediateFn = function (e) { h = e }, "undefined" != typeof module && module.exports ? module.exports = i : e.Promise || (e.Promise = i) }(this), "undefined" != typeof window && "function" != typeof window.CustomEvent && function () { function e(e, t) { t = t || { bubbles: !1, cancelable: !1, detail: void 0 }; var i = document.createEvent("CustomEvent"); return i.initCustomEvent(e, t.bubbles, t.cancelable, t.detail), i } e.prototype = window.Event.prototype, window.CustomEvent = e }(), "undefined" == typeof HTMLCanvasElement || HTMLCanvasElement.prototype.toBlob || Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", { value: function (e, t, i) { for (var n = atob(this.toDataURL(t, i).split(",")[1]), o = n.length, r = new Uint8Array(o), a = 0; a < o; a++)r[a] = n.charCodeAt(a); e(new Blob([r], { type: t || "image/png" })) } }); var e, t, i, n = ["Webkit", "Moz", "ms"], o = "undefined" != typeof document ? document.createElement("div").style : {}, r = [1, 8, 3, 6], a = [2, 7, 4, 5]; function s(e) { if (e in o) return e; for (var t = e[0].toUpperCase() + e.slice(1), i = n.length; i--;)if ((e = n[i] + t) in o) return e } function l(e, t) { e = e || {}; for (var i in t) t[i] && t[i].constructor && t[i].constructor === Object ? (e[i] = e[i] || {}, l(e[i], t[i])) : e[i] = t[i]; return e } function h(e) { return l({}, e) } function u(e) { if ("createEvent" in document) { var t = document.createEvent("HTMLEvents"); t.initEvent("change", !1, !0), e.dispatchEvent(t) } else e.fireEvent("onchange") } function c(e, t, i) { if ("string" == typeof t) { var n = t; (t = {})[n] = i } for (var o in t) e.style[o] = t[o] } function p(e, t) { e.classList ? e.classList.add(t) : e.className += " " + t } function d(e, t) { for (var i in t) e.setAttribute(i, t[i]) } function m(e) { return parseInt(e, 10) } function f(e, t) { var i = e.naturalWidth, n = e.naturalHeight, o = t || y(e); if (o && o >= 5) { var r = i; i = n, n = r } return { width: i, height: n } } t = s("transform"), e = s("transformOrigin"), i = s("userSelect"); var v = { translate3d: { suffix: ", 0px" }, translate: { suffix: "" } }, g = function (e, t, i) { this.x = parseFloat(e), this.y = parseFloat(t), this.scale = parseFloat(i) }; g.parse = function (e) { return e.style ? g.parse(e.style[t]) : e.indexOf("matrix") > -1 || e.indexOf("none") > -1 ? g.fromMatrix(e) : g.fromString(e) }, g.fromMatrix = function (e) { var t = e.substring(7).split(","); return t.length && "none" !== e || (t = [1, 0, 0, 1, 0, 0]), new g(m(t[4]), m(t[5]), parseFloat(t[0])) }, g.fromString = function (e) { var t = e.split(") "), i = t[0].substring(T.globals.translate.length + 1).split(","), n = t.length > 1 ? t[1].substring(6) : 1, o = i.length > 1 ? i[0] : 0, r = i.length > 1 ? i[1] : 0; return new g(o, r, n) }, g.prototype.toString = function () { var e = v[T.globals.translate].suffix || ""; return T.globals.translate + "(" + this.x + "px, " + this.y + "px" + e + ") scale(" + this.scale + ")" }; var w = function (t) { if (!t || !t.style[e]) return this.x = 0, void (this.y = 0); var i = t.style[e].split(" "); this.x = parseFloat(i[0]), this.y = parseFloat(i[1]) }; function y(e) { return e.exifdata && e.exifdata.Orientation ? m(e.exifdata.Orientation) : 1 } function b(e, t, i) { var n = t.width, o = t.height, r = e.getContext("2d"); switch (e.width = t.width, e.height = t.height, r.save(), i) { case 2: r.translate(n, 0), r.scale(-1, 1); break; case 3: r.translate(n, o), r.rotate(180 * Math.PI / 180); break; case 4: r.translate(0, o), r.scale(1, -1); break; case 5: e.width = o, e.height = n, r.rotate(90 * Math.PI / 180), r.scale(1, -1); break; case 6: e.width = o, e.height = n, r.rotate(90 * Math.PI / 180), r.translate(0, -o); break; case 7: e.width = o, e.height = n, r.rotate(-90 * Math.PI / 180), r.translate(-n, o), r.scale(1, -1); break; case 8: e.width = o, e.height = n, r.translate(0, n), r.rotate(-90 * Math.PI / 180) }r.drawImage(t, 0, 0, n, o), r.restore() } function x() { var n, o, r, a, s, l, h = this.options.viewport.type ? "cr-vp-" + this.options.viewport.type : null; this.options.useCanvas = this.options.enableOrientation || C.call(this), this.data = {}, this.elements = {}, n = this.elements.boundary = document.createElement("div"), r = this.elements.viewport = document.createElement("div"), o = this.elements.img = document.createElement("img"), a = this.elements.overlay = document.createElement("div"), this.options.useCanvas ? (this.elements.canvas = document.createElement("canvas"), this.elements.preview = this.elements.canvas) : this.elements.preview = o, p(n, "cr-boundary"), n.setAttribute("aria-dropeffect", "none"), s = this.options.boundary.width, l = this.options.boundary.height, c(n, { width: s + (isNaN(s) ? "" : "px"), height: l + (isNaN(l) ? "" : "px") }), p(r, "cr-viewport"), h && p(r, h), c(r, { width: this.options.viewport.width + "px", height: this.options.viewport.height + "px" }), r.setAttribute("tabindex", 0), p(this.elements.preview, "cr-image"), d(this.elements.preview, { alt: "preview", "aria-grabbed": "false" }), p(a, "cr-overlay"), this.element.appendChild(n), n.appendChild(this.elements.preview), n.appendChild(r), n.appendChild(a), p(this.element, "croppie-container"), this.options.customClass && p(this.element, this.options.customClass), function () { var e, n, o, r, a, s = this, l = !1; function h(e, t) { var i = s.elements.preview.getBoundingClientRect(), n = a.y + t, o = a.x + e; s.options.enforceBoundary ? (r.top > i.top + t && r.bottom < i.bottom + t && (a.y = n), r.left > i.left + e && r.right < i.right + e && (a.x = o)) : (a.y = n, a.x = o) } function p(e) { s.elements.preview.setAttribute("aria-grabbed", e), s.elements.boundary.setAttribute("aria-dropeffect", e ? "move" : "none") } function d(t) { if ((void 0 === t.button || 0 === t.button) && (t.preventDefault(), !l)) { if (l = !0, e = t.pageX, n = t.pageY, t.touches) { var o = t.touches[0]; e = o.pageX, n = o.pageY } p(l), a = g.parse(s.elements.preview), window.addEventListener("mousemove", m), window.addEventListener("touchmove", m), window.addEventListener("mouseup", f), window.addEventListener("touchend", f), document.body.style[i] = "none", r = s.elements.viewport.getBoundingClientRect() } } function m(i) { i.preventDefault(); var r = i.pageX, l = i.pageY; if (i.touches) { var p = i.touches[0]; r = p.pageX, l = p.pageY } var d = r - e, m = l - n, f = {}; if ("touchmove" === i.type && i.touches.length > 1) { var v = i.touches[0], g = i.touches[1], w = Math.sqrt((v.pageX - g.pageX) * (v.pageX - g.pageX) + (v.pageY - g.pageY) * (v.pageY - g.pageY)); o || (o = w / s._currentZoom); var y = w / o; return E.call(s, y), void u(s.elements.zoomer) } h(d, m), f[t] = a.toString(), c(s.elements.preview, f), L.call(s), n = l, e = r } function f() { p(l = !1), window.removeEventListener("mousemove", m), window.removeEventListener("touchmove", m), window.removeEventListener("mouseup", f), window.removeEventListener("touchend", f), document.body.style[i] = "", _.call(s), z.call(s), o = 0 } s.elements.overlay.addEventListener("mousedown", d), s.elements.viewport.addEventListener("keydown", function (e) { var n = 37, l = 38, u = 39, p = 40; if (!e.shiftKey || e.keyCode !== l && e.keyCode !== p) { if (s.options.enableKeyMovement && e.keyCode >= 37 && e.keyCode <= 40) { e.preventDefault(); var d = function (e) { switch (e) { case n: return [1, 0]; case l: return [0, 1]; case u: return [-1, 0]; case p: return [0, -1] } }(e.keyCode); a = g.parse(s.elements.preview), document.body.style[i] = "none", r = s.elements.viewport.getBoundingClientRect(), function (e) { var n = e[0], r = e[1], l = {}; h(n, r), l[t] = a.toString(), c(s.elements.preview, l), L.call(s), document.body.style[i] = "", _.call(s), z.call(s), o = 0 }(d) } } else { var m; m = e.keyCode === l ? parseFloat(s.elements.zoomer.value) + parseFloat(s.elements.zoomer.step) : parseFloat(s.elements.zoomer.value) - parseFloat(s.elements.zoomer.step), s.setZoom(m) } }), s.elements.overlay.addEventListener("touchstart", d) }.call(this), this.options.enableZoom && function () { var i = this, n = i.elements.zoomerWrap = document.createElement("div"), o = i.elements.zoomer = document.createElement("input"); function r() { (function (i) { var n = this, o = i ? i.transform : g.parse(n.elements.preview), r = i ? i.viewportRect : n.elements.viewport.getBoundingClientRect(), a = i ? i.origin : new w(n.elements.preview); function s() { var i = {}; i[t] = o.toString(), i[e] = a.toString(), c(n.elements.preview, i) } if (n._currentZoom = i ? i.value : n._currentZoom, o.scale = n._currentZoom, n.elements.zoomer.setAttribute("aria-valuenow", n._currentZoom), s(), n.options.enforceBoundary) { var l = function (e) { var t = this._currentZoom, i = e.width, n = e.height, o = this.elements.boundary.clientWidth / 2, r = this.elements.boundary.clientHeight / 2, a = this.elements.preview.getBoundingClientRect(), s = a.width, l = a.height, h = i / 2, u = n / 2, c = -1 * (h / t - o), p = -1 * (u / t - r), d = 1 / t * h, m = 1 / t * u; return { translate: { maxX: c, minX: c - (s * (1 / t) - i * (1 / t)), maxY: p, minY: p - (l * (1 / t) - n * (1 / t)) }, origin: { maxX: s * (1 / t) - d, minX: d, maxY: l * (1 / t) - m, minY: m } } }.call(n, r), h = l.translate, u = l.origin; o.x >= h.maxX && (a.x = u.minX, o.x = h.maxX), o.x <= h.minX && (a.x = u.maxX, o.x = h.minX), o.y >= h.maxY && (a.y = u.minY, o.y = h.maxY), o.y <= h.minY && (a.y = u.maxY, o.y = h.minY) } s(), M.call(n), z.call(n) }).call(i, { value: parseFloat(o.value), origin: new w(i.elements.preview), viewportRect: i.elements.viewport.getBoundingClientRect(), transform: g.parse(i.elements.preview) }) } function a(e) { var t, n; if ("ctrl" === i.options.mouseWheelZoom && !0 !== e.ctrlKey) return 0; t = e.wheelDelta ? e.wheelDelta / 1200 : e.deltaY ? e.deltaY / 1060 : e.detail ? e.detail / -60 : 0, n = i._currentZoom + t * i._currentZoom, e.preventDefault(), E.call(i, n), r.call(i) } p(n, "cr-slider-wrap"), p(o, "cr-slider"), o.type = "range", o.step = "0.0001", o.value = "1", o.style.display = i.options.showZoomer ? "" : "none", o.setAttribute("aria-label", "zoom"), i.element.appendChild(n), n.appendChild(o), i._currentZoom = 1, i.elements.zoomer.addEventListener("input", r), i.elements.zoomer.addEventListener("change", r), i.options.mouseWheelZoom && (i.elements.boundary.addEventListener("mousewheel", a), i.elements.boundary.addEventListener("DOMMouseScroll", a)) }.call(this), this.options.enableResize && function () { var e, t, n, o, r, a, s, l = this, h = document.createElement("div"), u = !1, d = 50; p(h, "cr-resizer"), c(h, { width: this.options.viewport.width + "px", height: this.options.viewport.height + "px" }), this.options.resizeControls.height && (p(a = document.createElement("div"), "cr-resizer-vertical"), h.appendChild(a)); this.options.resizeControls.width && (p(s = document.createElement("div"), "cr-resizer-horisontal"), h.appendChild(s)); function m(a) { if ((void 0 === a.button || 0 === a.button) && (a.preventDefault(), !u)) { var s = l.elements.overlay.getBoundingClientRect(); if (u = !0, t = a.pageX, n = a.pageY, e = -1 !== a.currentTarget.className.indexOf("vertical") ? "v" : "h", o = s.width, r = s.height, a.touches) { var h = a.touches[0]; t = h.pageX, n = h.pageY } window.addEventListener("mousemove", f), window.addEventListener("touchmove", f), window.addEventListener("mouseup", v), window.addEventListener("touchend", v), document.body.style[i] = "none" } } function f(i) { var a = i.pageX, s = i.pageY; if (i.preventDefault(), i.touches) { var u = i.touches[0]; a = u.pageX, s = u.pageY } var p = a - t, m = s - n, f = l.options.viewport.height + m, v = l.options.viewport.width + p; "v" === e && f >= d && f <= r ? (c(h, { height: f + "px" }), l.options.boundary.height += m, c(l.elements.boundary, { height: l.options.boundary.height + "px" }), l.options.viewport.height += m, c(l.elements.viewport, { height: l.options.viewport.height + "px" })) : "h" === e && v >= d && v <= o && (c(h, { width: v + "px" }), l.options.boundary.width += p, c(l.elements.boundary, { width: l.options.boundary.width + "px" }), l.options.viewport.width += p, c(l.elements.viewport, { width: l.options.viewport.width + "px" })), L.call(l), X.call(l), _.call(l), z.call(l), n = s, t = a } function v() { u = !1, window.removeEventListener("mousemove", f), window.removeEventListener("touchmove", f), window.removeEventListener("mouseup", v), window.removeEventListener("touchend", v), document.body.style[i] = "" } a && (a.addEventListener("mousedown", m), a.addEventListener("touchstart", m)); s && (s.addEventListener("mousedown", m), s.addEventListener("touchstart", m)); this.elements.boundary.appendChild(h) }.call(this) } function C() { return this.options.enableExif && window.EXIF } function E(e) { if (this.options.enableZoom) { var t = this.elements.zoomer, i = O(e, 4); t.value = Math.max(parseFloat(t.min), Math.min(parseFloat(t.max), i)).toString() } } function _(i) { var n = this._currentZoom, o = this.elements.preview.getBoundingClientRect(), r = this.elements.viewport.getBoundingClientRect(), a = g.parse(this.elements.preview.style[t]), s = new w(this.elements.preview), l = r.top - o.top + r.height / 2, h = r.left - o.left + r.width / 2, u = {}, p = {}; if (i) { var d = s.x, m = s.y, f = a.x, v = a.y; u.y = d, u.x = m, a.y = f, a.x = v } else u.y = l / n, u.x = h / n, p.y = (u.y - s.y) * (1 - n), p.x = (u.x - s.x) * (1 - n), a.x -= p.x, a.y -= p.y; var y = {}; y[e] = u.x + "px " + u.y + "px", y[t] = a.toString(), c(this.elements.preview, y) } function L() { if (this.elements) { var e = this.elements.boundary.getBoundingClientRect(), t = this.elements.preview.getBoundingClientRect(); c(this.elements.overlay, { width: t.width + "px", height: t.height + "px", top: t.top - e.top + "px", left: t.left - e.left + "px" }) } } w.prototype.toString = function () { return this.x + "px " + this.y + "px" }; var R, B, Z, I, M = (R = L, B = 500, function () { var e = this, t = arguments, i = Z && !I; clearTimeout(I), I = setTimeout(function () { I = null, Z || R.apply(e, t) }, B), i && R.apply(e, t) }); function z() { var e, t = this.get(); F.call(this) && (this.options.update.call(this, t), this.$ && "undefined" == typeof Prototype ? this.$(this.element).trigger("update.croppie", t) : (window.CustomEvent ? e = new CustomEvent("update", { detail: t }) : (e = document.createEvent("CustomEvent")).initCustomEvent("update", !0, !0, t), this.element.dispatchEvent(e))) } function F() { return this.elements.preview.offsetHeight > 0 && this.elements.preview.offsetWidth > 0 } function W() { var i, n = {}, o = this.elements.preview, r = new g(0, 0, 1), a = new w; F.call(this) && !this.data.bound && (this.data.bound = !0, n[t] = r.toString(), n[e] = a.toString(), n.opacity = 1, c(o, n), i = this.elements.preview.getBoundingClientRect(), this._originalImageWidth = i.width, this._originalImageHeight = i.height, this.data.orientation = C.call(this) ? y(this.elements.img) : this.data.orientation, this.options.enableZoom ? X.call(this, !0) : this._currentZoom = 1, r.scale = this._currentZoom, n[t] = r.toString(), c(o, n), this.data.points.length ? function (i) { if (4 !== i.length) throw "Croppie - Invalid number of points supplied: " + i; var n = i[2] - i[0], o = this.elements.viewport.getBoundingClientRect(), r = this.elements.boundary.getBoundingClientRect(), a = { left: o.left - r.left, top: o.top - r.top }, s = o.width / n, l = i[1], h = i[0], u = -1 * i[1] + a.top, p = -1 * i[0] + a.left, d = {}; d[e] = h + "px " + l + "px", d[t] = new g(p, u, s).toString(), c(this.elements.preview, d), E.call(this, s), this._currentZoom = s }.call(this, this.data.points) : function () { var e = this.elements.preview.getBoundingClientRect(), i = this.elements.viewport.getBoundingClientRect(), n = this.elements.boundary.getBoundingClientRect(), o = i.left - n.left, r = i.top - n.top, a = o - (e.width - i.width) / 2, s = r - (e.height - i.height) / 2, l = new g(a, s, this._currentZoom); c(this.elements.preview, t, l.toString()) }.call(this), _.call(this), L.call(this)) } function X(e) { var t, i, n, o, r = Math.max(this.options.minZoom, 0) || 0, a = this.options.maxZoom || 1.5, s = this.elements.zoomer, l = parseFloat(s.value), h = this.elements.boundary.getBoundingClientRect(), c = f(this.elements.img, this.data.orientation), p = this.elements.viewport.getBoundingClientRect(); this.options.enforceBoundary && (n = p.width / c.width, o = p.height / c.height, r = Math.max(n, o)), r >= a && (a = r + 1), s.min = O(r, 4), s.max = O(a, 4), !e && (l < s.min || l > s.max) ? E.call(this, l < s.min ? s.min : s.max) : e && (i = Math.max(h.width / c.width, h.height / c.height), t = null !== this.data.boundZoom ? this.data.boundZoom : i, E.call(this, t)), u(s) } function Y(e) { var t = e.points, i = m(t[0]), n = m(t[1]), o = m(t[2]) - i, r = m(t[3]) - n, a = e.circle, s = document.createElement("canvas"), l = s.getContext("2d"), h = e.outputWidth || o, u = e.outputHeight || r; s.width = h, s.height = u, e.backgroundColor && (l.fillStyle = e.backgroundColor, l.fillRect(0, 0, h, u)); var c = i, p = n, d = o, f = r, v = 0, g = 0, w = h, y = u; return i < 0 && (c = 0, v = Math.abs(i) / o * h), d + c > this._originalImageWidth && (w = (d = this._originalImageWidth - c) / o * h), n < 0 && (p = 0, g = Math.abs(n) / r * u), f + p > this._originalImageHeight && (y = (f = this._originalImageHeight - p) / r * u), l.drawImage(this.elements.preview, c, p, d, f, v, g, w, y), a && (l.fillStyle = "#fff", l.globalCompositeOperation = "destination-in", l.beginPath(), l.arc(s.width / 2, s.height / 2, s.width / 2, 0, 2 * Math.PI, !0), l.closePath(), l.fill()), s } function H(e, t) { var i, n = this, o = [], r = null, a = C.call(n); if ("string" == typeof e) i = e, e = {}; else if (Array.isArray(e)) o = e.slice(); else { if (void 0 === e && n.data.url) return W.call(n), z.call(n), null; i = e.url, o = e.points || [], r = void 0 === e.zoom ? null : e.zoom } return n.data.bound = !1, n.data.url = i || n.data.url, n.data.boundZoom = r, function (e, t) { if (!e) throw "Source image missing"; var i = new Image; return i.style.opacity = "0", new Promise(function (n, o) { function r() { i.style.opacity = "1", setTimeout(function () { n(i) }, 1) } i.removeAttribute("crossOrigin"), e.match(/^https?:\/\/|^\/\//) && i.setAttribute("crossOrigin", "anonymous"), i.onload = function () { t ? EXIF.getData(i, function () { r() }) : r() }, i.onerror = function (e) { i.style.opacity = 1, setTimeout(function () { o(e) }, 1) }, i.src = e }) }(i, a).then(function (i) { if (function (e) { this.elements.img.parentNode && (Array.prototype.forEach.call(this.elements.img.classList, function (t) { e.classList.add(t) }), this.elements.img.parentNode.replaceChild(e, this.elements.img), this.elements.preview = e), this.elements.img = e }.call(n, i), o.length) n.options.relative && (o = [o[0] * i.naturalWidth / 100, o[1] * i.naturalHeight / 100, o[2] * i.naturalWidth / 100, o[3] * i.naturalHeight / 100]); else { var r, a, s = f(i), l = n.elements.viewport.getBoundingClientRect(), h = l.width / l.height; s.width / s.height > h ? r = (a = s.height) * h : (r = s.width, a = s.height / h); var u = (s.width - r) / 2, c = (s.height - a) / 2, p = u + r, d = c + a; n.data.points = [u, c, p, d] } n.data.orientation = e.orientation || 1, n.data.points = o.map(function (e) { return parseFloat(e) }), n.options.useCanvas && function (e) { var t = this.elements.canvas, i = this.elements.img; t.getContext("2d").clearRect(0, 0, t.width, t.height), t.width = i.width, t.height = i.height, b(t, i, this.options.enableOrientation && e || y(i)) }.call(n, n.data.orientation), W.call(n), z.call(n), t && t() }) } function O(e, t) { return parseFloat(e).toFixed(t || 0) } function k() { var e = this.elements.preview.getBoundingClientRect(), t = this.elements.viewport.getBoundingClientRect(), i = t.left - e.left, n = t.top - e.top, o = (t.width - this.elements.viewport.offsetWidth) / 2, r = (t.height - this.elements.viewport.offsetHeight) / 2, a = i + this.elements.viewport.offsetWidth + o, s = n + this.elements.viewport.offsetHeight + r, l = this._currentZoom; (l === 1 / 0 || isNaN(l)) && (l = 1); var h = this.options.enforceBoundary ? 0 : Number.NEGATIVE_INFINITY; return i = Math.max(h, i / l), n = Math.max(h, n / l), a = Math.max(h, a / l), s = Math.max(h, s / l), { points: [O(i), O(n), O(a), O(s)], zoom: l, orientation: this.data.orientation } } var A = { type: "canvas", format: "png", quality: 1 }, S = ["jpeg", "webp", "png"]; function j(e) { var t = this, i = k.call(t), n = l(h(A), h(e)), o = "string" == typeof e ? e : n.type || "base64", r = n.size || "viewport", a = n.format, s = n.quality, u = n.backgroundColor, d = "boolean" == typeof n.circle ? n.circle : "circle" === t.options.viewport.type, m = t.elements.viewport.getBoundingClientRect(), f = m.width / m.height; return "viewport" === r ? (i.outputWidth = m.width, i.outputHeight = m.height) : "object" == typeof r && (r.width && r.height ? (i.outputWidth = r.width, i.outputHeight = r.height) : r.width ? (i.outputWidth = r.width, i.outputHeight = r.width / f) : r.height && (i.outputWidth = r.height * f, i.outputHeight = r.height)), S.indexOf(a) > -1 && (i.format = "image/" + a, i.quality = s), i.circle = d, i.url = t.data.url, i.backgroundColor = u, new Promise(function (e) { switch (o.toLowerCase()) { case "rawcanvas": e(Y.call(t, i)); break; case "canvas": case "base64": e(function (e) { return Y.call(this, e).toDataURL(e.format, e.quality) }.call(t, i)); break; case "blob": (function (e) { var t = this; return new Promise(function (i) { Y.call(t, e).toBlob(function (e) { i(e) }, e.format, e.quality) }) }).call(t, i).then(e); break; default: e(function (e) { var t = e.points, i = document.createElement("div"), n = document.createElement("img"), o = t[2] - t[0], r = t[3] - t[1]; return p(i, "croppie-result"), i.appendChild(n), c(n, { left: -1 * t[0] + "px", top: -1 * t[1] + "px" }), n.src = e.url, c(i, { width: o + "px", height: r + "px" }), i }.call(t, i)) } }) } function N(e) { if (!this.options.useCanvas || !this.options.enableOrientation) throw "Croppie: Cannot rotate without enableOrientation && EXIF.js included"; var t, i, n, o, s, l = this.elements.canvas; if (this.data.orientation = (t = this.data.orientation, i = e, n = r.indexOf(t) > -1 ? r : a, o = n.indexOf(t), s = i / 90 % n.length, n[(n.length + o + s % n.length) % n.length]), b(l, this.elements.img, this.data.orientation), _.call(this, !0), X.call(this), Math.abs(e) / 90 % 2 == 1) { var h = this._originalImageHeight, u = this._originalImageWidth; this._originalImageWidth = h, this._originalImageHeight = u } } if ("undefined" != typeof window && window.jQuery) { var P = window.jQuery; P.fn.croppie = function (e) { if ("string" === typeof e) { var t = Array.prototype.slice.call(arguments, 1), i = P(this).data("croppie"); return "get" === e ? i.get() : "result" === e ? i.result.apply(i, t) : "bind" === e ? i.bind.apply(i, t) : this.each(function () { var i = P(this).data("croppie"); if (i) { var n = i[e]; if (!P.isFunction(n)) throw "Croppie " + e + " method not found"; n.apply(i, t), "destroy" === e && P(this).removeData("croppie") } }) } return this.each(function () { var t = new T(this, e); t.$ = P, P(this).data("croppie", t) }) } } function T(e, t) { if (e.className.indexOf("croppie-container") > -1) throw new Error("Croppie: Can't initialize croppie more than once"); if (this.element = e, this.options = l(h(T.defaults), t), "img" === this.element.tagName.toLowerCase()) { var i = this.element; p(i, "cr-original-image"), d(i, { "aria-hidden": "true", alt: "" }); var n = document.createElement("div"); this.element.parentNode.appendChild(n), n.appendChild(i), this.element = n, this.options.url = this.options.url || i.src } if (x.call(this), this.options.url) { var o = { url: this.options.url, points: this.options.points }; delete this.options.url, delete this.options.points, H.call(this, o) } } return T.defaults = { viewport: { width: 100, height: 100, type: "square" }, boundary: {}, orientationControls: { enabled: !0, leftClass: "", rightClass: "" }, resizeControls: { width: !0, height: !0 }, customClass: "", showZoomer: !0, enableZoom: !0, enableResize: !1, mouseWheelZoom: !0, enableExif: !1, enforceBoundary: !0, enableOrientation: !1, enableKeyMovement: !0, update: function () { } }, T.globals = { translate: "translate3d" }, l(T.prototype, { bind: function (e, t) { return H.call(this, e, t) }, get: function () { var e = k.call(this), t = e.points; return this.options.relative && (t[0] /= this.elements.img.naturalWidth / 100, t[1] /= this.elements.img.naturalHeight / 100, t[2] /= this.elements.img.naturalWidth / 100, t[3] /= this.elements.img.naturalHeight / 100), e }, result: function (e) { return j.call(this, e) }, refresh: function () { return function () { W.call(this) }.call(this) }, setZoom: function (e) { E.call(this, e), u(this.elements.zoomer) }, rotate: function (e) { N.call(this, e) }, destroy: function () { return function () { var e, t; this.element.removeChild(this.elements.boundary), e = this.element, t = "croppie-container", e.classList ? e.classList.remove(t) : e.className = e.className.replace(t, ""), this.options.enableZoom && this.element.removeChild(this.elements.zoomerWrap), delete this.elements }.call(this) } }), T });
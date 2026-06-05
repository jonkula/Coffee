import pkg from 'exifr';
const { parse } = pkg;

export async function extractExif(filepath) {
  try {
    const exif = await parse(filepath, {
      pick: ['DateTimeOriginal', 'CreateDate', 'GPSLatitude', 'GPSLongitude',
             'GPSLatitudeRef', 'GPSLongitudeRef', 'Make', 'Model', 'ImageWidth', 'ImageHeight'],
    });

    if (!exif) return {};

    let latitude = null;
    let longitude = null;

    if (exif.GPSLatitude && exif.GPSLongitude) {
      latitude = exif.GPSLatitude;
      longitude = exif.GPSLongitude;
      if (exif.GPSLatitudeRef === 'S') latitude = -latitude;
      if (exif.GPSLongitudeRef === 'W') longitude = -longitude;
    }

    const dateTaken = exif.DateTimeOriginal || exif.CreateDate;

    return {
      date_taken: dateTaken ? dateTaken.toISOString() : null,
      latitude,
      longitude,
      camera_make: exif.Make || null,
      camera_model: exif.Model || null,
    };
  } catch {
    return {};
  }
}

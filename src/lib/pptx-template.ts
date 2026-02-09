import JSZip from "jszip";
import JSZipUtils from "jszip-utils";

// Helper to load binary file
const loadFile = (url: string, callback: (err: any, data: any) => void) => {
    JSZipUtils.getBinaryContent(url, callback);
};

// Helper to replace text in XML safely and handle font shrinking
const replaceInString = (str: string, map: Record<string, string>, shrinkTitle: boolean = false) => {
    let newStr = str;
    
    // 1. Handle Font Shrinking for titles if requested
    if (shrinkTitle && map["title"]) {
        const titleLen = map["title"].length;
        if (titleLen > 40) {
            // Standard font size in XML is often 3200-4400 (32pt-44pt)
            // We search for sz="XXXX" and reduce it. 
            // This is a naive heuristic but works for most SlideGo/Slidesgo templates
            const shrinkFactor = Math.max(0.6, 1 - (titleLen - 40) / 100);
            
            // Regex to find font size attributes in the same paragraph as the title
            // We look for sz="(\d+)" near the title tag
            const szRegex = /sz="(\d+)"/g;
            newStr = newStr.replace(szRegex, (_, p1) => {
                const newSize = Math.floor(parseInt(p1) * shrinkFactor);

                return `sz="${newSize}"`;
            });
        }
    }

    Object.keys(map).forEach(key => {
        // XML escape function
        const escapeXml = (unsafe: string) => {
            return unsafe.replace(/[<>&'"]/g, (c) => {
                switch (c) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case '\'': return '&apos;';
                    case '"': return '&quot;';
                }
                return c;
            });
        };
        const escapedValue = escapeXml(map[key] || "");
        // Replace {key} globally
        const regex = new RegExp(`{${key}}`, 'g');
        newStr = newStr.replace(regex, escapedValue);
    });
    return newStr;
};

// Helper: Fetch image from URL and return ArrayBuffer
const fetchImageArrayBuffer = async (url: string): Promise<ArrayBuffer | null> => {
    try {
        const response = await fetch(url);
        return await response.arrayBuffer();
    } catch (e) {
        console.error("Failed to fetch image for PPTX:", e);
        return null;
    }
};

export const generateFromTemplate = (presentation: any, templatePath: string = "/template.pptx", onFallback: () => void) => {
    loadFile(templatePath, async (error: any, content: any) => {
        if (error) {
            console.warn("Template not found or error loading:", error);
            onFallback();
            return;
        }

        try {
            const zip = new JSZip();
            await zip.loadAsync(content);

            // 1. Identify Slide Files
            const slideFiles: { name: string, relsName: string, id: number }[] = [];
            zip.folder("ppt/slides")?.forEach((relativePath) => {
                if (relativePath.startsWith("slide") && relativePath.endsWith(".xml")) {

                    const id = parseInt(relativePath.replace("slide", "").replace(".xml", ""));
                    slideFiles.push({ 
                        name: `ppt/slides/${relativePath}`, 
                        relsName: `ppt/slides/_rels/${relativePath}.rels`,
                        id 
                    });
                }
            });
            
            // Sort slides by ID (slide1, slide2, slide3...)
            slideFiles.sort((a, b) => a.id - b.id);

            // 2. Prepare Data
            const titleSlideData = presentation.slides.find((s: any) => s.layout === 'title') || presentation.slides[0];
            const tocSlideData = presentation.slides.find((s: any) => s.layout === 'tableOfContents');
            const contentSlidesData = presentation.slides.filter((s: any) => s.layout !== 'title' && s.layout !== 'tableOfContents');

            // Overflow Check
            const availableContentSlots = slideFiles.length - 2; 
            if (contentSlidesData.length > availableContentSlots) {
                alert(`Warning: The presentation has ${contentSlidesData.length} content slides, but your template only has space for ${availableContentSlots}. Please duplicate more slides in your template!`);
            }

            // 3. Process Slides 1-by-1
            const slidesToKeepCount = 2 + contentSlidesData.length;
            const slidesToRemove: number[] = [];

            for (let i = 0; i < slideFiles.length; i++) {
                const slideFile = slideFiles[i];
                
                if (i >= slidesToKeepCount) {
                    // Collect for deletion
                    slidesToRemove.push(i);
                    continue;
                }

                const file = zip.file(slideFile.name);
                if (!file) continue;

                let xml = await file.async("string");
                
                // MAPPING LOGIC
                if (i === 0) {
                     // Slide 1: Title
                     xml = replaceInString(xml, {
                         "title": titleSlideData.title,
                         "subtitle": titleSlideData.content?.[0] || ""
                     }, true); // Shrink Title if long
                }
                else if (i === 1) {
                     // Slide 2: TOC
                     xml = replaceInString(xml, {
                         "toc_list": tocSlideData ? tocSlideData.content.join('\n') : "",
                         "title": "Table of Contents"
                     });
                }
                else {
                    // Slide 3+: Content
                    const contentIndex = i - 2;
                    if (contentIndex < contentSlidesData.length) {
                        const slideData = contentSlidesData[contentIndex];
                        
                        // TEXT REPLACEMENT
                        xml = replaceInString(xml, {
                            "title": slideData.title,
                            "section_title": slideData.title,
                            "content": slideData.content ? slideData.content.join('\n') : "",
                            "page": (contentIndex + 1).toString()
                        }, true); // Shrink Title if long

                        // IMAGE HIJACK LOGIC
                        if (slideData.layout === 'image-text' && slideData.backgroundImage) {
                            const blipRegex = /<a:blip[^>]*r:embed="(rId\d+)"[^>]*>/;
                            const match = xml.match(blipRegex);
                            
                            if (match && match[1]) {
                                const relId = match[1];
                                const relsFile = zip.file(slideFile.relsName);
                                
                                if (relsFile) {
                                    let relsXml = await relsFile.async("string");
                                    const imgBuffer = await fetchImageArrayBuffer(slideData.backgroundImage);
                                    
                                    if (imgBuffer) {
                                        const newImgName = `slide_${i}_image.jpg`;
                                        zip.file(`ppt/media/${newImgName}`, imgBuffer);
                                        const relRegex = new RegExp(`(Relationship[^>]*Id="${relId}"[^>]*Target=")([^"]+)(")`);
                                        relsXml = relsXml.replace(relRegex, `$1../media/${newImgName}$3`);
                                        zip.file(slideFile.relsName, relsXml);
                                    }
                                }
                            }
                        }
                    }
                }

                zip.file(slideFile.name, xml);
            }

            // 4. CLEANUP: Delete extra slides from structure
            if (slidesToRemove.length > 0) {
                console.log(`Removing ${slidesToRemove.length} unused slides...`);
                
                // A. Update ppt/presentation.xml
                const presentationFile = zip.file("ppt/presentation.xml");
                if (presentationFile) {
                    let presXml = await presentationFile.async("string");
                    
                    // We need to find the specific <p:sldId> tags for the removed slides
                    // Usually they are in order: <p:sldId id="..." r:id="rId1" />
                    // The easiest way is to match the rId which corresponds to the slide index in many templates
                    // BUT it's safer to use a regex that captures all sldId tags and removes the tail
                    
                    const sldIdLstRegex = /(<p:sldIdLst>)([\s\S]*?)(<\/p:sldIdLst>)/;
                    const match = presXml.match(sldIdLstRegex);
                    
                    if (match) {
                        const sldIds = match[2].match(/<p:sldId [\s\S]*?\/>/g) || [];
                        const keptSldIds = sldIds.slice(0, slidesToKeepCount);
                        presXml = presXml.replace(sldIdLstRegex, `$1${keptSldIds.join('')}$3`);
                        zip.file("ppt/presentation.xml", presXml);
                    }
                }

                // B. Delete files from ZIP to save space
                slidesToRemove.forEach(index => {
                    const slideFile = slideFiles[index];
                    zip.remove(slideFile.name);
                    zip.remove(slideFile.relsName);
                });
            }

            // 5. Download
            const out = await zip.generateAsync({
                type: "blob",
                mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            });

            const url = URL.createObjectURL(out);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.pptx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (processError) {
             console.error("Template Processing Error:", processError);
             alert("Error processing the template. Falling back to standard export.");
             onFallback();
        }
    });
};

/**
 * NEW: Extract background images from the template for Web Preview
 */
export const extractTemplateBackgrounds = (templatePath: string = "/template.pptx"): Promise<{titleBg?: string, contentBg?: string}> => {
    return new Promise((resolve) => {
        loadFile(templatePath, async (error: any, content: any) => {
            if (error) {
                console.warn("Could not load template for backgrounds:", error);
                resolve({});
                return;
            }

            try {
                const zip = new JSZip();
                await zip.loadAsync(content);
                const backgrounds: {titleBg?: string, contentBg?: string} = {};

                // We'll look at Slide 1 (Title) and Slide 3 (Typical Content Slide)
                const slidesToExtract = [
                    { key: 'titleBg' as const, slidePath: 'ppt/slides/slide1.xml', relsPath: 'ppt/slides/_rels/slide1.xml.rels' },
                    { key: 'contentBg' as const, slidePath: 'ppt/slides/slide3.xml', relsPath: 'ppt/slides/_rels/slide3.xml.rels' }
                ];

                for (const item of slidesToExtract) {
                    const slideFile = zip.file(item.slidePath);
                    const relsFile = zip.file(item.relsPath);
                    if (!slideFile || !relsFile) continue;

                    const slideXml = await slideFile.async("string");
                    const relsXml = await relsFile.async("string");

                    // 1. Precise Background Detection: Look for <p:bg> blip rId
                    // <p:bg> ... <a:blip r:embed="rId2"> ... </p:bg>
                    const bgMatch = slideXml.match(/<p:bg>[\s\S]*?r:embed="(rId\d+)"/);
                    let targetRId = bgMatch ? bgMatch[1] : null;

                    // 2. Fallback: If no explicit background, maybe it's just the first large image or inherited?
                    // Many templates use a full-slide image that isn't technically set as "background"
                    if (!targetRId) {
                        // Look for any image relationship
                        const anyImgMatch = relsXml.match(/Relationship [^>]*Type="[^"]*image" [^>]*Id="(rId\d+)"/);
                        targetRId = anyImgMatch ? anyImgMatch[1] : null;
                    }

                    if (targetRId) {
                        // 3. Find the Target image path for this rId
                        const relRegex = new RegExp(`Relationship [^>]*Id="${targetRId}" [^>]*Target="..\/media\/([^"]+)"`);
                        const imgPathMatch = relsXml.match(relRegex);
                        
                        if (imgPathMatch && imgPathMatch[1]) {
                            const imgName = imgPathMatch[1];
                            const imgFile = zip.file(`ppt/media/${imgName}`);
                            
                            if (imgFile) {
                                const base64 = await imgFile.async("base64");
                                const ext = imgName.split('.').pop()?.toLowerCase() || 'png';
                                backgrounds[item.key] = `data:image/${ext};base64,${base64}`;
                            }
                        }
                    }
                }

                resolve(backgrounds);
            } catch (e) {
                console.error("Failed to extract backgrounds:", e);
                resolve({});
            }
        });
    });
};

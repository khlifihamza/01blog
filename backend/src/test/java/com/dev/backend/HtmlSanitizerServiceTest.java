package com.dev.backend;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import com.dev.backend.service.HtmlSanitizerService;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class HtmlSanitizerServiceTest {

    private HtmlSanitizerService htmlSanitizerService;

    @BeforeEach
    void setUp() {
        htmlSanitizerService = new HtmlSanitizerService();
    }

    @Test
    void testSanitizeContent_AllowsValidBlogContent() {
        String input = "<p>This is a <strong>blog post</strong> with <img src=\"http://localhost:8080/api/post/file/ca4b8bb0-9dce-4277-89a2-972999e642c0.webp\" alt=\"test\" style=\"max-width: 100%; height: auto;\"> and some text.</p>";
        String result = htmlSanitizerService.sanitizeContent(input);

        assertTrue(result.contains("<p>"));
        assertTrue(result.contains("<strong>"));
        assertTrue(result.contains("<img")); //true
        assertTrue(result.contains("src=\"http://localhost:8080/api/post/file/ca4b8bb0-9dce-4277-89a2-972999e642c0.webp\"")); //false
    }

    @Test
    void testSanitizeContent_RemovesMaliciousScript() {
        String input = "<p>Normal content</p><script>alert('xss')</script>";
        String result = htmlSanitizerService.sanitizeContent(input);

        assertTrue(result.contains("<p>Normal content</p>"));
        assertFalse(result.contains("<script>"));
        assertFalse(result.contains("alert"));
    }

    @Test
    void testSanitizeContent_RemovesOnEventHandlers() {
        String input = "<img src=\"image.jpg\" onclick=\"maliciousCode()\" alt=\"test\">";
        String result = htmlSanitizerService.sanitizeContent(input);

        assertTrue(result.contains("src=\"image.jpg\""));
        assertTrue(result.contains("alt=\"test\""));
        assertFalse(result.contains("onclick"));
        assertFalse(result.contains("maliciousCode"));
    }

    @Test
    void testSanitizeContent_AllowsMediaElements() {
        String input = "<div class=\"media-element\" contenteditable=\"false\" data-media-id=\"123\">" +
                "<video src=\"/api/post/file/video.mp4\" controls=\"true\" style=\"max-width: 100%;\"></video>" +
                "<button type=\"button\" class=\"delete-btn\"><mat-icon>delete</mat-icon></button>" +
                "</div>";
        String result = htmlSanitizerService.sanitizeContent(input);

        assertTrue(result.contains("class=\"media-element\""));
        assertTrue(result.contains("data-media-id=\"123\""));
        assertTrue(result.contains("<video"));
        assertTrue(result.contains("controls"));
        assertTrue(result.contains("<button"));
        assertTrue(result.contains("<mat-icon>"));
    }

    @Test
    void testSanitizeContent_FiltersInvalidUrls() {
        String input = "<img src=\"javascript:alert('xss')\" alt=\"test\">";
        String result = htmlSanitizerService.sanitizeContent(input);

        // Should remove the malicious src but keep the img tag
        assertFalse(result.contains("javascript:"));
        assertTrue(result.contains("alt=\"test\""));
    }

    @Test
    void testSanitizeTitle_RemovesAllHtml() {
        String input = "Blog <script>alert('xss')</script> Title <b>Bold</b>";
        String result = htmlSanitizerService.sanitizeTitle(input);

        assertEquals("Blog  Title Bold", result);
        assertFalse(result.contains("<"));
        assertFalse(result.contains(">"));
    }

    @Test
    void testSanitizeContent_PreservesWhitespace() {
        String input = "<p>First paragraph</p>\n\n<p>Second paragraph</p>";
        String result = htmlSanitizerService.sanitizeContent(input);

        assertTrue(result.contains("First paragraph"));
        assertTrue(result.contains("Second paragraph"));
    }
}
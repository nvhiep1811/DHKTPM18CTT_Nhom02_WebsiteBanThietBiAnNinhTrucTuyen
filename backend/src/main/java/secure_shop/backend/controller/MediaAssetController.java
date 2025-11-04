package secure_shop.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import secure_shop.backend.dto.product.MediaAssetDTO;
import secure_shop.backend.service.MediaAssetService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaAssetController {

    private final MediaAssetService mediaAssetService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<MediaAssetDTO>> getByProductId(@PathVariable UUID productId) {
        List<MediaAssetDTO> list = mediaAssetService.getMediaByProductId(productId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MediaAssetDTO> addMedia(
            @RequestParam UUID productId,
            @RequestParam String url,
            @RequestParam(required = false) String altText) {

        MediaAssetDTO dto = mediaAssetService.addMediaToProduct(productId, url, altText);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMedia(@PathVariable Long id) {
        mediaAssetService.deleteMedia(id);
        return ResponseEntity.noContent().build();
    }
}